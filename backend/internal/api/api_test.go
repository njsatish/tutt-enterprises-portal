package api

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
)

func TestHealth(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	rec := httptest.NewRecorder()
	New().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200; got %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), `"status":"ok"`) {
		t.Fatalf("unexpected body: %s", rec.Body.String())
	}
}

func TestUnknownRoute(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/missing", nil)
	rec := httptest.NewRecorder()
	New().ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404; got %d", rec.Code)
	}
}

func TestBooksyInstantLink(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/booksy-link?widgetId=94095&variantId=9396822&date=2099-10-01T14:40", nil)
	rec := httptest.NewRecorder()
	New().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200; got %d: %s", rec.Code, rec.Body.String())
	}
	for _, want := range []string{"instant-experiences/widget/94095", "variantId=9396822", "date=2099-10-01T14%3A40"} {
		if !strings.Contains(rec.Body.String(), want) {
			t.Fatalf("expected %q in response: %s", want, rec.Body.String())
		}
	}
}

func TestBooksyInstantRedirect(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/booksy-redirect?widgetId=94095&variantId=9396822&date=2099-10-01T14:40", nil)
	rec := httptest.NewRecorder()
	New().ServeHTTP(rec, req)
	if rec.Code != http.StatusFound {
		t.Fatalf("expected 302; got %d", rec.Code)
	}
	if !strings.Contains(rec.Header().Get("Location"), "instant-experiences/widget/94095") {
		t.Fatalf("unexpected redirect: %s", rec.Header().Get("Location"))
	}
}

func TestBooksyInstantLinkRejectsInvalidInput(t *testing.T) {
	for _, target := range []string{
		"/api/booksy-link?widgetId=x&variantId=9396822&date=2099-10-01T14:40",
		"/api/booksy-link?widgetId=94095&variantId=9396822&date=not-a-date",
	} {
		req := httptest.NewRequest(http.MethodGet, target, nil)
		rec := httptest.NewRecorder()
		New().ServeHTTP(rec, req)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400 for %s; got %d", target, rec.Code)
		}
	}
}

func TestBooksyInstantLinkIncludesPortalAttribution(t *testing.T) {
	link, err := buildBooksyInstantURL(1700058, 20194287, "2099-10-02T16:50")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	parsed, err := url.Parse(link)
	if err != nil {
		t.Fatalf("unable to parse generated URL: %v", err)
	}
	if parsed.Host != "booksy.com" {
		t.Fatalf("unexpected host: %s", parsed.Host)
	}
	if parsed.Path != "/en-us/instant-experiences/widget/1700058" {
		t.Fatalf("unexpected path: %s", parsed.Path)
	}
	if parsed.Query().Get("variantId") != "20194287" {
		t.Fatalf("variantId was not preserved: %s", link)
	}
	if parsed.Query().Get("date") != "2099-10-02T16:50" {
		t.Fatalf("date and time were not preserved: %s", link)
	}
	if parsed.Query().Get("attribution_source") != "high_quality_barbershop_portal" {
		t.Fatalf("portal attribution is missing: %s", link)
	}
	if parsed.Query().Get("utm_medium") != "timeslots" {
		t.Fatalf("timeslot attribution is missing: %s", link)
	}
	if parsed.Fragment != "ba_s=seo" {
		t.Fatalf("Booksy fragment is missing: %s", link)
	}
}
