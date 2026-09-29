package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestBusiness(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/business", nil)
	rec := httptest.NewRecorder()
	New().ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	var b Business
	if err := json.NewDecoder(rec.Body).Decode(&b); err != nil {
		t.Fatal(err)
	}
	if b.ID != 38443 || b.Name != "Tutt Enterprises LLC" {
		t.Fatalf("unexpected business: %+v", b)
	}
}

func TestServices(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/services", nil)
	rec := httptest.NewRecorder()
	New().ServeHTTP(rec, req)
	var payload struct {
		Services []Service `json:"services"`
		Count    int       `json:"count"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&payload); err != nil {
		t.Fatal(err)
	}
	if payload.Count != 17 || len(payload.Services) != 17 {
		t.Fatalf("services = %d/%d", payload.Count, len(payload.Services))
	}
	if payload.Services[0].StaffID != 46537 {
		t.Fatalf("staff ID = %d", payload.Services[0].StaffID)
	}
}

func TestAdultCategory(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/services?category=adults", nil)
	rec := httptest.NewRecorder()
	New().ServeHTTP(rec, req)
	var payload struct {
		Count int `json:"count"`
	}
	if err := json.NewDecoder(rec.Body).Decode(&payload); err != nil {
		t.Fatal(err)
	}
	if payload.Count != 6 {
		t.Fatalf("adult service count = %d", payload.Count)
	}
}
