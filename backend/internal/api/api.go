package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"
)

type Service struct {
	ID              int    `json:"id"`
	VariantID       int    `json:"variantId,omitempty"`
	Slug            string `json:"slug"`
	Name            string `json:"name"`
	Description     string `json:"description"`
	DurationMinutes int    `json:"durationMinutes"`
	PriceLabel      string `json:"priceLabel"`
}

type Barber struct {
	ID            int       `json:"id"`
	BusinessID    int       `json:"businessId"`
	Slug          string    `json:"slug"`
	Name          string    `json:"name"`
	BusinessName  string    `json:"businessName"`
	Position      string    `json:"position"`
	PhotoURL      string    `json:"photoUrl"`
	BookingURL    string    `json:"bookingUrl"`
	Rating        *float64  `json:"rating"`
	ReviewCount   *int      `json:"reviewCount"`
	FeaturedLabel string    `json:"featuredLabel"`
	Services      []Service `json:"services"`
}

type AvailabilityTime struct {
	Value  string `json:"value"`
	Label  string `json:"label"`
	Period string `json:"period"`
}

type AvailabilityDate struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

type AvailabilityResponse struct {
	BarberSlug string             `json:"barberSlug"`
	ServiceID  int                `json:"serviceId"`
	Dates      []AvailabilityDate `json:"dates"`
	Times      []AvailabilityTime `json:"times"`
	Source     string             `json:"source"`
	Live       bool               `json:"live"`
	Notice     string             `json:"notice"`
}

type Handler struct{}

func New() Handler { return Handler{} }

func floatPtr(v float64) *float64 { return &v }
func intPtr(v int) *int           { return &v }

const venueBookingURL = "https://booksy.com/en-us/1548070_high-quality-barbershop_barber-shop_26718_greensboro"

var booksyDatePattern = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$`)

var barbers = []Barber{
	{
		ID: 1291255, BusinessID: 1359189, Slug: "alejandro", Name: "Alejandro",
		BusinessName: "ALESSANDRO PRO BARBER", Position: "Barber",
		PhotoURL:   "https://d2zdpiztbgorvt.cloudfront.net/region1/us/1359189/resource_photos/92741845208a4ba5b0caced3cbf55ef8.jpeg",
		BookingURL: "https://booksy.com/en-us/1359189_alessandro-pro-barber_barber-shop_26718_greensboro",
		Rating:     floatPtr(5.0), ReviewCount: intPtr(94), FeaturedLabel: "Regular Haircut",
		Services: []Service{
			{8479682, 17226087, "regular-haircut", "Regular Haircut", "Skin or light fade, scissor work, and a precise lineup.", 50, "$35.00+"},
			{8479688, 17226094, "haircut-and-beard", "Haircut and Beard", "Haircut, beard fade, lineup, and finishing care.", 70, "$45.00+"},
			{8479694, 17226100, "beard-service", "Beard Service", "Beard trim, lineup, and hydrating skin oil.", 20, "$25.00"},
			{8479699, 17226105, "kids-haircut", "Kids Haircut", "Light or skin fade, lineup, and scissor work.", 45, "$30.00"},
			{8479705, 17226113, "hyper-service", "Hyper Service", "Haircut, beard, eyebrows, hot towels, facial massage, and detail cleaning.", 90, "$65.00"},
			{8479714, 17226122, "head-line-up-shape", "Head Line Up and Shape", "Shape up with optional enhancement.", 15, "$25.00"},
			{8479716, 17226125, "shape-up-and-beard", "Shape Up and Beard", "Lineup and beard detailing.", 30, "$35.00"},
			{11416985, 20309828, "premium-silver-service", "Premium Silver Service", "Haircut, ear and nose detailing, and deep facial care.", 95, "$100.00"},
			{11416980, 20309823, "deep-facial-pore-reset", "Deep Facial Pore Reset", "Cleanser, scrub, exfoliation, blackhead suction, mask, steam, hot towel, and massage.", 30, "$70.00"},
			{11417006, 20309849, "premium-gold-service", "Premium Gold Service", "Haircut, beard service, detailing, and facial care.", 100, "$120.00"},
			{11445423, 20340307, "men-gift", "Men Gift", "Haircut, shampoo massage, beard, deep facial care, massage, and premium cologne.", 100, "$150.00"},
			{12853392, 21920946, "eyebrow-shape", "Eyebrow Shape", "Eyebrow shaping service.", 10, "$10.00"},
		},
	},
	{
		ID: 542621, BusinessID: 629741, Slug: "barlyn-german", Name: "Barlyn German",
		BusinessName: "Barlyn The Barber", Position: "Barber", BookingURL: venueBookingURL,
		FeaturedLabel: "Men's Haircut",
		Services: []Service{
			{9208573, 18000120, "sunday-haircut", "Sunday Haircut", "Sunday haircut appointment.", 45, "$60.00"},
			{4009830, 9141992, "black-color-beard-trimmer", "Black Color Beard and Trimmer", "Beard color and trimmer service.", 30, "$40.00"},
			{4009828, 9141986, "mens-haircut", "Men's Haircut", "Men's haircut service.", 40, "$40.00"},
		},
	},
	{
		ID: 1501903, BusinessID: 1582174, Slug: "alvarez-barber", Name: "Alvarez Barber",
		BusinessName: "Alvarez Barber", Position: "Barber",
		PhotoURL:   "https://d2zdpiztbgorvt.cloudfront.net/region1/us/1582174/resource_photos/3f5ba211eb7f4fd49cdcd965b96d0d-alvarez-barber-alvarez-barber-5dbd5e30f1284b439eded5842f6ab4-booksy.jpeg",
		BookingURL: venueBookingURL, FeaturedLabel: "Alvarez VIP",
		Services: []Service{{12492713, 21512417, "alvarez-vip", "Alvarez VIP", "VIP grooming service.", 70, "$70.00"}},
	},
	{
		ID: 1719444, BusinessID: 1792760, Slug: "jhonny", Name: "Jhonny",
		BusinessName: "Jhonnybarber", Position: "Barber", BookingURL: venueBookingURL,
		FeaturedLabel: "Male Haircut",
		Services:      []Service{{12271585, 21262323, "male-haircut", "Male Haircut", "Male haircut service.", 45, "$35.00+"}},
	},
	{
		ID: 1789632, BusinessID: 1861163, Slug: "landin-newton", Name: "Landin Newton",
		BusinessName: "Landincuts", Position: "Barber", BookingURL: venueBookingURL,
		FeaturedLabel: "Shape Up",
		Services:      []Service{{13027604, 22114761, "shape-up", "Shape Up", "Precision shape-up service.", 30, "$20.00"}},
	},
	{
		ID: 1778867, BusinessID: 1850913, Slug: "wilson-garcia", Name: "Wilson Garcia",
		BusinessName: "Wilson Style", Position: "Barber", BookingURL: venueBookingURL,
		FeaturedLabel: "Male Haircut",
		Services:      []Service{{13069016, 22161053, "male-haircut", "Male Haircut", "Male haircut service.", 40, "$40.00"}},
	},
}

func availabilityPreview(barberSlug, serviceID string) (AvailabilityResponse, bool) {
	if barberSlug != "alejandro" || serviceID != "8479694" {
		return AvailabilityResponse{}, false
	}

	times := []AvailabilityTime{
		{Value: "09:00", Label: "9:00 AM", Period: "morning"},
		{Value: "09:30", Label: "9:30 AM", Period: "morning"},
		{Value: "09:45", Label: "9:45 AM", Period: "morning"},
		{Value: "10:00", Label: "10:00 AM", Period: "morning"},
		{Value: "10:15", Label: "10:15 AM", Period: "morning"},
		{Value: "10:30", Label: "10:30 AM", Period: "morning"},
		{Value: "11:00", Label: "11:00 AM", Period: "morning"},
		{Value: "12:00", Label: "12:00 PM", Period: "afternoon"},
		{Value: "13:00", Label: "1:00 PM", Period: "afternoon"},
		{Value: "14:00", Label: "2:00 PM", Period: "afternoon"},
		{Value: "15:00", Label: "3:00 PM", Period: "afternoon"},
		{Value: "16:00", Label: "4:00 PM", Period: "afternoon"},
		{Value: "17:00", Label: "5:00 PM", Period: "evening"},
		{Value: "18:00", Label: "6:00 PM", Period: "evening"},
		{Value: "19:00", Label: "7:00 PM", Period: "evening"},
		{Value: "20:00", Label: "8:00 PM", Period: "evening"},
		{Value: "21:00", Label: "9:00 PM", Period: "evening"},
		{Value: "21:30", Label: "9:30 PM", Period: "evening"},
	}

	return AvailabilityResponse{
		BarberSlug: barberSlug,
		ServiceID:  8479694,
		Dates:      []AvailabilityDate{{Value: "2026-09-28", Label: "Mon, Sep 28"}},
		Times:      times,
		Source:     "booksy-response-fixture",
		Live:       false,
		Notice:     "Integration preview based on a captured Booksy response. Confirm current availability on Booksy.",
	}, true
}

func buildBooksyInstantURL(widgetID, variantID int, date string) (string, error) {
	if widgetID <= 0 || variantID <= 0 {
		return "", fmt.Errorf("widgetId and variantId must be positive integers")
	}
	if !booksyDatePattern.MatchString(date) {
		return "", fmt.Errorf("date must use YYYY-MM-DDTHH:MM")
	}
	parsed, err := time.Parse("2006-01-02T15:04", date)
	if err != nil {
		return "", fmt.Errorf("invalid date: %w", err)
	}
	if parsed.Before(time.Now().Add(-5 * time.Minute)) {
		return "", fmt.Errorf("date must not be in the past")
	}
	u := url.URL{
		Scheme: "https",
		Host:   "booksy.com",
		Path:   fmt.Sprintf("/en-us/instant-experiences/widget/%d", widgetID),
	}
	query := u.Query()
	query.Set("variantId", strconv.Itoa(variantID))
	query.Set("date", date)
	query.Set("attribution_source", "high_quality_barbershop_portal")
	query.Set("utm_medium", "timeslots")
	u.RawQuery = query.Encode()
	u.Fragment = "ba_s=seo"
	return u.String(), nil
}

func parseBooksyLinkRequest(r *http.Request) (int, int, string, error) {
	widgetID, err := strconv.Atoi(r.URL.Query().Get("widgetId"))
	if err != nil {
		return 0, 0, "", fmt.Errorf("valid widgetId is required")
	}
	variantID, err := strconv.Atoi(r.URL.Query().Get("variantId"))
	if err != nil {
		return 0, 0, "", fmt.Errorf("valid variantId is required")
	}
	date := r.URL.Query().Get("date")
	return widgetID, variantID, date, nil
}

func (h Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	path := strings.TrimSuffix(r.URL.Path, "/")

	switch {
	case r.Method == http.MethodGet && path == "/api/health":
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "hqbarbershop-api"})
	case r.Method == http.MethodGet && path == "/api/business":
		writeJSON(w, http.StatusOK, map[string]any{
			"name":        "High Quality Barbershop",
			"address":     "4411 W Gate City Blvd, Suite 105, Greensboro, NC 27407",
			"website":     "https://hqbarbershop.denduluru.com",
			"barberCount": len(barbers),
		})
	case r.Method == http.MethodGet && path == "/api/availability":
		h.serveLiveAvailability(w, r)
		return

	case r.Method == http.MethodGet && path == "/api/booksy-link":
		widgetID, variantID, date, err := parseBooksyLinkRequest(r)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		link, err := buildBooksyInstantURL(widgetID, variantID, date)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		w.Header().Set("Cache-Control", "no-store")
		writeJSON(w, http.StatusOK, map[string]any{
			"url": link, "widgetId": widgetID, "variantId": variantID, "date": date,
		})
	case r.Method == http.MethodGet && path == "/api/booksy-redirect":
		widgetID, variantID, date, err := parseBooksyLinkRequest(r)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		link, err := buildBooksyInstantURL(widgetID, variantID, date)
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		w.Header().Set("Cache-Control", "no-store")
		http.Redirect(w, r, link, http.StatusFound)
	case r.Method == http.MethodGet && path == "/api/barbers":
		writeJSON(w, http.StatusOK, map[string]any{"barbers": barbers})
	case r.Method == http.MethodGet && strings.HasPrefix(path, "/api/barbers/"):
		slug := strings.TrimPrefix(path, "/api/barbers/")
		for _, barber := range barbers {
			if barber.Slug == slug {
				writeJSON(w, http.StatusOK, barber)
				return
			}
		}
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "barber not found"})
	case r.Method == http.MethodGet && path == "/api/services":
		var services []Service
		for _, barber := range barbers {
			services = append(services, barber.Services...)
		}
		writeJSON(w, http.StatusOK, map[string]any{"services": services})
	default:
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "route not found"})
	}
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
