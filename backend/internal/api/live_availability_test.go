package api

import (
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
)

func TestLiveAvailabilityProxy(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/availability/alejandro/regular-haircut" {
			t.Fatalf("unexpected route: %s", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"success":true,"nextAvailable":{"date":"2099-10-01","time":"14:40"},"windowStart":"2099-10-01","windowEnd":"2099-10-14","slots":[{"date":"2099-10-01","time":"14:40"},{"date":"2099-10-01","time":"15:00"},{"date":"2099-10-02","time":"09:00"}]}`))
	}))
	defer upstream.Close()

	previous := os.Getenv("HQ_AVAILABILITY_API_BASE")
	t.Cleanup(func() { _ = os.Setenv("HQ_AVAILABILITY_API_BASE", previous) })
	_ = os.Setenv("HQ_AVAILABILITY_API_BASE", upstream.URL)

	req := httptest.NewRequest(http.MethodGet, "/api/availability?barberSlug=alejandro&serviceId=8479682", nil)
	rec := httptest.NewRecorder()
	New().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200; got %d: %s", rec.Code, rec.Body.String())
	}
	body := rec.Body.String()
	for _, want := range []string{`"live":true`, `"value":"2099-10-01"`, `"date":"2099-10-01","value":"14:40"`, `"label":"2:40 PM"`} {
		if !strings.Contains(body, want) {
			t.Fatalf("expected %s in response: %s", want, body)
		}
	}
}

func TestLiveAvailabilityRejectsUnknownCombination(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/availability?barberSlug=alejandro&serviceId=999999", nil)
	rec := httptest.NewRecorder()
	New().ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404; got %d", rec.Code)
	}
}

func TestNormalizeLiveAvailabilityDeduplicatesSlots(t *testing.T) {
	result := normalizeLiveAvailability("alejandro", 8479682, upstreamAvailability{
		Success: true,
		Slots: []upstreamSlot{
			{Date: "2099-10-01", Time: "14:40"},
			{Date: "2099-10-01", Time: "14:40"},
			{Date: "bad", Time: "14:40"},
		},
	})
	if len(result.Dates) != 1 || len(result.Slots) != 1 {
		t.Fatalf("expected one date and one slot; got %d dates and %d slots", len(result.Dates), len(result.Slots))
	}
}
