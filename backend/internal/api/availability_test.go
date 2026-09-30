package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func withAvailabilityTemplate(t *testing.T, value string) {
	t.Helper()
	old, existed := os.LookupEnv("BOOKSY_AVAILABILITY_URL_TEMPLATE")
	if err := os.Setenv("BOOKSY_AVAILABILITY_URL_TEMPLATE", value); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if existed {
			_ = os.Setenv("BOOKSY_AVAILABILITY_URL_TEMPLATE", old)
		} else {
			_ = os.Unsetenv("BOOKSY_AVAILABILITY_URL_TEMPLATE")
		}
	})
}

func TestAvailabilityRequiresConfiguration(t *testing.T) {
	_ = os.Unsetenv("BOOKSY_AVAILABILITY_URL_TEMPLATE")
	req := httptest.NewRequest(http.MethodGet, "/api/availability?barberSlug=stacy-tutt-iii&serviceId=533707", nil)
	rec := httptest.NewRecorder()
	New().ServeHTTP(rec, req)
	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d", rec.Code)
	}
}

func TestAvailabilityRejectsUnknownService(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/availability?barberSlug=stacy-tutt-iii&serviceId=999999", nil)
	rec := httptest.NewRecorder()
	New().ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d", rec.Code)
	}
}

func TestAvailabilityProxyAndNormalization(t *testing.T) {
	upstream := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("business") != "38443" || r.URL.Query().Get("staff") != "46537" || r.URL.Query().Get("service") != "533707" || r.URL.Query().Get("variant") != "5469993" {
			t.Fatalf("unexpected query: %s", r.URL.RawQuery)
		}
		_ = json.NewEncoder(w).Encode(map[string]any{
			"dates": []map[string]string{{"value": "2026-10-01", "label": "Thu, Oct 1"}},
			"slots": []map[string]string{{"date": "2026-10-01", "value": "10:30", "label": "10:30 AM"}},
		})
	}))
	defer upstream.Close()
	withAvailabilityTemplate(t, upstream.URL+"?business={businessId}&staff={staffId}&service={serviceId}&variant={variantId}")
	handler := availabilityHandler(upstream.Client())
	req := httptest.NewRequest(http.MethodGet, "/api/availability?barberSlug=stacy-tutt-iii&serviceId=533707", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body=%s", rec.Code, rec.Body.String())
	}
	var result AvailabilityResponse
	if err := json.NewDecoder(rec.Body).Decode(&result); err != nil {
		t.Fatal(err)
	}
	if result.ServiceID != 533707 || result.VariantID != 5469993 || len(result.Dates) != 1 || len(result.Slots) != 1 {
		t.Fatalf("unexpected result: %+v", result)
	}
}
