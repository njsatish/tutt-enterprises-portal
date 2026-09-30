package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"
)

const availabilityTimeout = 12 * time.Second

type AvailabilityDate struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

type AvailabilitySlot struct {
	Date  string `json:"date"`
	Value string `json:"value"`
	Label string `json:"label"`
}

type AvailabilityResponse struct {
	BarberSlug string             `json:"barberSlug"`
	ServiceID  int                `json:"serviceId"`
	VariantID  int                `json:"variantId"`
	Dates      []AvailabilityDate `json:"dates"`
	Slots      []AvailabilitySlot `json:"slots"`
}

type upstreamAvailability struct {
	BarberSlug string             `json:"barberSlug"`
	ServiceID  int                `json:"serviceId"`
	VariantID  int                `json:"variantId"`
	Dates      []AvailabilityDate `json:"dates"`
	Slots      []AvailabilitySlot `json:"slots"`
}

func serviceByID(id int) (Service, bool) {
	for _, service := range services {
		if service.ID == id {
			return service, true
		}
	}
	return Service{}, false
}

func availabilityUpstreamURL(service Service) (string, error) {
	template := strings.TrimSpace(os.Getenv("BOOKSY_AVAILABILITY_URL_TEMPLATE"))
	if template == "" {
		return "", errors.New("BOOKSY_AVAILABILITY_URL_TEMPLATE is not configured")
	}
	replacements := map[string]string{
		"{businessId}": strconv.Itoa(business.ID),
		"{staffId}":    strconv.Itoa(service.StaffID),
		"{serviceId}":  strconv.Itoa(service.ID),
		"{variantId}":  strconv.Itoa(service.VariantID),
	}
	result := template
	for placeholder, value := range replacements {
		result = strings.ReplaceAll(result, placeholder, url.QueryEscape(value))
	}
	parsed, err := url.Parse(result)
	if err != nil || parsed.Scheme != "https" || parsed.Host == "" {
		return "", errors.New("availability upstream must be a valid HTTPS URL")
	}
	return result, nil
}

func normalizeAvailability(service Service, upstream upstreamAvailability) AvailabilityResponse {
	uniqueDates := map[string]AvailabilityDate{}
	for _, date := range upstream.Dates {
		if date.Value != "" {
			uniqueDates[date.Value] = date
		}
	}
	slots := make([]AvailabilitySlot, 0, len(upstream.Slots))
	seenSlots := map[string]bool{}
	for _, slot := range upstream.Slots {
		if slot.Date == "" || slot.Value == "" {
			continue
		}
		key := slot.Date + "T" + slot.Value
		if seenSlots[key] {
			continue
		}
		seenSlots[key] = true
		if slot.Label == "" {
			slot.Label = slot.Value
		}
		slots = append(slots, slot)
		if _, ok := uniqueDates[slot.Date]; !ok {
			uniqueDates[slot.Date] = AvailabilityDate{Value: slot.Date, Label: slot.Date}
		}
	}
	dates := make([]AvailabilityDate, 0, len(uniqueDates))
	for _, date := range uniqueDates {
		if date.Label == "" {
			date.Label = date.Value
		}
		dates = append(dates, date)
	}
	sort.Slice(dates, func(i, j int) bool { return dates[i].Value < dates[j].Value })
	sort.Slice(slots, func(i, j int) bool {
		return slots[i].Date+slots[i].Value < slots[j].Date+slots[j].Value
	})
	return AvailabilityResponse{
		BarberSlug: "stacy-tutt-iii",
		ServiceID:  service.ID,
		VariantID:  service.VariantID,
		Dates:      dates,
		Slots:      slots,
	}
}

func availabilityHandler(client *http.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		if r.URL.Query().Get("barberSlug") != "stacy-tutt-iii" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "valid barberSlug is required"})
			return
		}
		serviceID, err := strconv.Atoi(r.URL.Query().Get("serviceId"))
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "valid serviceId is required"})
			return
		}
		service, ok := serviceByID(serviceID)
		if !ok || service.StaffID != 46537 {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "service is not configured for Stacy Tutt III"})
			return
		}
		upstreamURL, err := availabilityUpstreamURL(service)
		if err != nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "live availability is not configured"})
			return
		}
		ctx, cancel := context.WithTimeout(r.Context(), availabilityTimeout)
		defer cancel()
		request, err := http.NewRequestWithContext(ctx, http.MethodGet, upstreamURL, nil)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "unable to create availability request"})
			return
		}
		request.Header.Set("Accept", "application/json")
		if token := strings.TrimSpace(os.Getenv("BOOKSY_AVAILABILITY_BEARER_TOKEN")); token != "" {
			request.Header.Set("Authorization", "Bearer "+token)
		}
		response, err := client.Do(request)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "availability provider is unavailable"})
			return
		}
		defer response.Body.Close()
		if response.StatusCode < 200 || response.StatusCode >= 300 {
			io.Copy(io.Discard, response.Body)
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": fmt.Sprintf("availability provider returned %d", response.StatusCode)})
			return
		}
		var upstream upstreamAvailability
		decoder := json.NewDecoder(io.LimitReader(response.Body, 2<<20))
		if err := decoder.Decode(&upstream); err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "availability provider returned invalid data"})
			return
		}
		if upstream.ServiceID != 0 && upstream.ServiceID != service.ID {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "availability provider returned the wrong service"})
			return
		}
		if upstream.VariantID != 0 && upstream.VariantID != service.VariantID {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "availability provider returned the wrong variant"})
			return
		}
		writeJSON(w, http.StatusOK, normalizeAvailability(service, upstream))
	}
}
