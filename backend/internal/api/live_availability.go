package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"
)

const defaultAvailabilityBaseURL = "https://b7srmq72xf.execute-api.us-east-1.amazonaws.com"

var liveAvailabilityRoutes = map[string]string{
	"alejandro:8479682":       "/availability/alejandro/regular-haircut",
	"alejandro:8479688":       "/availability/alejandro/haircut-and-beard",
	"alejandro:8479694":       "/availability/alejandro/beard-service",
	"alejandro:8479699":       "/availability/alejandro/kids-haircut",
	"alejandro:8479705":       "/availability/alejandro/hyper-service",
	"alejandro:8479714":       "/availability/alejandro/head-line-up-shape",
	"alejandro:8479716":       "/availability/alejandro/shape-up-and-beard",
	"alejandro:11416985":      "/availability/alejandro/premium-silver-service",
	"alejandro:11416980":      "/availability/alejandro/deep-facial-pore-reset",
	"alejandro:11417006":      "/availability/alejandro/premium-gold-service",
	"alejandro:11445423":      "/availability/alejandro/men-gift",
	"alejandro:12853392":      "/availability/alejandro/eyebrow-shape",
	"barlyn-german:9208573":   "/availability/barlyn-german/sunday-haircut",
	"barlyn-german:4009830":   "/availability/barlyn-german/black-color-beard-trimmer",
	"barlyn-german:4009828":   "/availability/barlyn-german/mens-haircut",
	"alvarez-barber:12492713": "/availability/alvarez-barber/alvarez-vip",
	"jhonny:12271585":         "/availability/jhonny/male-haircut",
	"landin-newton:13027604":  "/availability/landin-newton/shape-up",
	"wilson-garcia:13069016":  "/availability/wilson-garcia/male-haircut",
}

type upstreamSlot struct {
	Date string `json:"date"`
	Time string `json:"time"`
}

type upstreamAvailability struct {
	Success       bool           `json:"success"`
	NextAvailable *upstreamSlot  `json:"nextAvailable"`
	WindowStart   string         `json:"windowStart"`
	WindowEnd     string         `json:"windowEnd"`
	Slots         []upstreamSlot `json:"slots"`
}

type normalizedSlot struct {
	Date   string `json:"date"`
	Value  string `json:"value"`
	Label  string `json:"label"`
	Period string `json:"period"`
}

type liveAvailabilityResponse struct {
	BarberSlug    string             `json:"barberSlug"`
	ServiceID     int                `json:"serviceId"`
	NextAvailable *upstreamSlot      `json:"nextAvailable,omitempty"`
	WindowStart   string             `json:"windowStart"`
	WindowEnd     string             `json:"windowEnd"`
	Dates         []AvailabilityDate `json:"dates"`
	Slots         []normalizedSlot   `json:"slots"`
	Times         []AvailabilityTime `json:"times"`
	Source        string             `json:"source"`
	Live          bool               `json:"live"`
	Notice        string             `json:"notice"`
}

func availabilityBaseURL() string {
	if value := strings.TrimRight(os.Getenv("HQ_AVAILABILITY_API_BASE"), "/"); value != "" {
		return value
	}
	return defaultAvailabilityBaseURL
}

func hasBarberService(barberSlug string, serviceID int) bool {
	for _, barber := range barbers {
		if barber.Slug != barberSlug {
			continue
		}
		for _, service := range barber.Services {
			if service.ID == serviceID {
				return true
			}
		}
	}
	return false
}

func availabilityRoute(barberSlug string, serviceID int) (string, bool) {
	route, ok := liveAvailabilityRoutes[fmt.Sprintf("%s:%d", barberSlug, serviceID)]
	return route, ok
}

func formatDateLabel(value string) string {
	parsed, err := time.Parse("2006-01-02", value)
	if err != nil {
		return value
	}
	return parsed.Format("Mon, Jan 2")
}

func formatTimeLabel(value string) string {
	parsed, err := time.Parse("15:04", value)
	if err != nil {
		return value
	}
	return parsed.Format("3:04 PM")
}

func timePeriod(value string) string {
	parsed, err := time.Parse("15:04", value)
	if err != nil {
		return ""
	}
	hour := parsed.Hour()
	if hour < 12 {
		return "morning"
	}
	if hour < 17 {
		return "afternoon"
	}
	return "evening"
}

func fetchLiveAvailability(ctx context.Context, client *http.Client, baseURL, route string) (upstreamAvailability, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, strings.TrimRight(baseURL, "/")+route, nil)
	if err != nil {
		return upstreamAvailability{}, err
	}
	req.Header.Set("Accept", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return upstreamAvailability{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return upstreamAvailability{}, fmt.Errorf("upstream availability returned HTTP %d", resp.StatusCode)
	}
	var payload upstreamAvailability
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return upstreamAvailability{}, err
	}
	if !payload.Success {
		return upstreamAvailability{}, fmt.Errorf("upstream availability reported failure")
	}
	return payload, nil
}

func normalizeLiveAvailability(barberSlug string, serviceID int, upstream upstreamAvailability) liveAvailabilityResponse {
	sort.Slice(upstream.Slots, func(i, j int) bool {
		if upstream.Slots[i].Date == upstream.Slots[j].Date {
			return upstream.Slots[i].Time < upstream.Slots[j].Time
		}
		return upstream.Slots[i].Date < upstream.Slots[j].Date
	})
	dates := make([]AvailabilityDate, 0)
	slots := make([]normalizedSlot, 0, len(upstream.Slots))
	seenDates := map[string]bool{}
	seenSlots := map[string]bool{}
	for _, slot := range upstream.Slots {
		if _, err := time.Parse("2006-01-02", slot.Date); err != nil {
			continue
		}
		if _, err := time.Parse("15:04", slot.Time); err != nil {
			continue
		}
		key := slot.Date + "T" + slot.Time
		if seenSlots[key] {
			continue
		}
		seenSlots[key] = true
		if !seenDates[slot.Date] {
			seenDates[slot.Date] = true
			dates = append(dates, AvailabilityDate{Value: slot.Date, Label: formatDateLabel(slot.Date)})
		}
		slots = append(slots, normalizedSlot{Date: slot.Date, Value: slot.Time, Label: formatTimeLabel(slot.Time), Period: timePeriod(slot.Time)})
	}
	return liveAvailabilityResponse{
		BarberSlug: barberSlug, ServiceID: serviceID, NextAvailable: upstream.NextAvailable,
		WindowStart: upstream.WindowStart, WindowEnd: upstream.WindowEnd,
		Dates: dates, Slots: slots, Times: []AvailabilityTime{}, Source: "hqbarbershop-availability-lambda",
		Live: true, Notice: "Live availability. Booksy confirms the appointment after you continue.",
	}
}

func (h Handler) serveLiveAvailability(w http.ResponseWriter, r *http.Request) {
	barberSlug := r.URL.Query().Get("barberSlug")
	serviceID, err := strconv.Atoi(r.URL.Query().Get("serviceId"))
	if err != nil || serviceID <= 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "valid serviceId is required"})
		return
	}
	if !hasBarberService(barberSlug, serviceID) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "barber and service combination not found"})
		return
	}
	route, ok := availabilityRoute(barberSlug, serviceID)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "live availability route not configured"})
		return
	}
	client := &http.Client{Timeout: 8 * time.Second}
	upstream, err := fetchLiveAvailability(r.Context(), client, availabilityBaseURL(), route)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": "live availability is temporarily unavailable"})
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	writeJSON(w, http.StatusOK, normalizeLiveAvailability(barberSlug, serviceID, upstream))
}
