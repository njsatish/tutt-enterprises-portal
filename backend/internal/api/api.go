package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

const bookingURL = "https://booksy.com/en-us/38443_tutt-enterprises-llc_barber-shop_134575_richmond"

type Business struct {
	ID            int      `json:"id"`
	Name          string   `json:"name"`
	Slug          string   `json:"slug"`
	Subdomain     string   `json:"subdomain"`
	AddressLine1  string   `json:"addressLine1"`
	AddressLine2  string   `json:"addressLine2"`
	CityStateZip  string   `json:"cityStateZip"`
	Phone         string   `json:"phone"`
	PhoneE164     string   `json:"phoneE164"`
	Email         string   `json:"email"`
	Latitude      float64  `json:"latitude"`
	Longitude     float64  `json:"longitude"`
	LogoURL       string   `json:"logoURL"`
	PhotoURL      string   `json:"photoURL"`
	MapsURL       string   `json:"mapsURL"`
	BookingURL    string   `json:"bookingURL"`
	BookingPolicy string   `json:"bookingPolicy"`
	ReviewsStars  float64  `json:"reviewsStars"`
	ReviewsCount  int      `json:"reviewsCount"`
	Hours         []string `json:"hours"`
}

type Staff struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	Slug       string `json:"slug"`
	Position   string `json:"position"`
	PhotoURL   string `json:"photoURL"`
	BusinessID int    `json:"businessId"`
}

type Service struct {
	ID              int     `json:"id"`
	VariantID       int     `json:"variantId"`
	StaffID         int     `json:"staffId"`
	Name            string  `json:"name"`
	Slug            string  `json:"slug"`
	Category        string  `json:"category"`
	CategoryLabel   string  `json:"categoryLabel"`
	Description     string  `json:"description"`
	DurationMinutes int     `json:"durationMinutes"`
	Price           float64 `json:"price"`
	PriceLabel      string  `json:"priceLabel"`
	BookingURL      string  `json:"bookingURL"`
}

var business = Business{
	ID: 38443, Name: "Tutt Enterprises LLC", Slug: "tutt-enterprises-llc", Subdomain: "tuttskuts",
	AddressLine1: "2101 E Parham Rd", AddressLine2: "Suite 103", CityStateZip: "Richmond, VA 23228",
	Phone: "(804) 337-3314", PhoneE164: "+18043373314", Email: "tuttskuts@gmail.com",
	Latitude: 37.640196, Longitude: -77.488131,
	LogoURL:    "https://d2zdpiztbgorvt.cloudfront.net/us/images/38443/logo_151509148986.jpg",
	PhotoURL:   "https://d2zdpiztbgorvt.cloudfront.net/us/images/38443/biz_photo_151487451762.jpg",
	MapsURL:    "https://www.google.com/maps/search/?api=1&query=2101+E+Parham+Rd+Suite+103+Richmond+VA+23228",
	BookingURL: bookingURL, BookingPolicy: "Changes allowed up to 2 hours before visit",
	ReviewsStars: 5, ReviewsCount: 319,
	Hours: []string{"Mon–Wed: 9:30 AM–4:00 PM", "Thu–Fri: 10:00 AM–7:00 PM", "Sat–Sun: Closed"},
}

var staff = []Staff{{
	ID: 46537, Name: "Stacy Tutt III", Slug: "stacy-tutt-iii", Position: "Barber", BusinessID: 38443,
	PhotoURL: "https://d2zdpiztbgorvt.cloudfront.net/us/2018/2/4/cf0653f53a1dae2f2c7b70b6dd304818.png",
}}

func svc(id, variant, minutes int, price float64, slug, name, category, label, description, priceLabel string) Service {
	return Service{ID: id, VariantID: variant, StaffID: 46537, Name: name, Slug: slug, Category: category, CategoryLabel: label, Description: description, DurationMinutes: minutes, Price: price, PriceLabel: priceLabel, BookingURL: bookingURL}
}

var services = []Service{
	svc(6230744, 14824485, 35, 32, "first-time-kids-haircut", "First-Time Kids Haircut, Ages 6–17", "first-time-customers", "First-Time Customers Only", "First appointment for youth clients.", "$32+"),
	svc(6230812, 14824562, 20, 20, "first-time-kids-lineup", "First-Time Kids Lineup, Ages 6–17", "first-time-customers", "First-Time Customers Only", "Lineup service without a taper.", "$20"),
	svc(6230770, 14824511, 45, 50, "first-time-adult-haircut-facial-hair", "First-Time Adult Haircut with Facial Hair", "first-time-customers", "First-Time Customers Only", "Adult haircut and facial-hair service.", "$50+"),
	svc(6230768, 14824509, 40, 38, "first-time-adult-haircut", "First-Time Adult Haircut", "first-time-customers", "First-Time Customers Only", "Complete first-time adult haircut.", "$38"),
	svc(6230806, 14824555, 30, 30, "first-time-adult-lineup-beard", "First-Time Adult Lineup and/or Beard Trim", "first-time-customers", "First-Time Customers Only", "Lineup or beard trim without a taper.", "$30"),
	svc(6230783, 14824525, 40, 35, "first-time-senior-haircut-facial-hair", "Senior Haircut with Facial Hair", "first-time-customers", "First-Time Customers Only", "First-time service for clients age 60+.", "$35"),
	svc(2923464, 5469996, 60, 70, "adult-one-child", "One Adult plus One Child", "family-deals", "Family Deals", "Adult haircut with facial hair plus one child haircut.", "$70"),
	svc(2923472, 5469995, 80, 90, "adult-two-children", "One Adult plus Two Children", "family-deals", "Family Deals", "Adult haircut with facial hair plus two child haircuts.", "$90"),
	svc(2923528, 5469997, 35, 35, "senior-haircut-facial-hair", "Senior Haircut Including Facial Hair", "adults", "Adults, Ages 18 and Older", "Haircut and facial-hair service for clients age 60+.", "$35"),
	svc(536060, 5469994, 45, 50, "adult-haircut-facial-hair", "Haircut with Facial Hair", "adults", "Adults, Ages 18 and Older", "Haircut, facial hair, and optional hairline enhancement.", "$50"),
	svc(533707, 5469993, 35, 38, "adult-haircut", "Haircut Only", "adults", "Adults, Ages 18 and Older", "Full haircut with optional hairline enhancement.", "$38"),
	svc(208643, 5469992, 25, 30, "adult-lineup-facial-hair", "Line Up with Facial Hair", "adults", "Adults, Ages 18 and Older", "Lineup and facial-hair detailing without a taper.", "$30"),
	svc(536085, 5469991, 15, 20, "adult-lineup", "Line Up", "adults", "Adults, Ages 18 and Older", "Hairline service without neck or temple tapering.", "$20"),
	svc(208644, 5469990, 20, 20, "facial-hair-only", "Facial Hair Only", "adults", "Adults, Ages 18 and Older", "Beard trim, beard line, or beard removal.", "$20"),
	svc(536178, 5469989, 30, 40, "youth-haircut-facial-hair", "Haircut with Facial Hair", "youth", "Youth, Ages 5–17", "Youth haircut with facial-hair detailing.", "$40"),
	svc(536151, 5469988, 30, 32, "youth-haircut", "Haircut Only", "youth", "Youth, Ages 5–17", "Complete haircut for youth clients.", "$32"),
	svc(536177, 5469987, 15, 20, "youth-lineup", "Line Up", "youth", "Youth, Ages 5–17", "Youth lineup, including longer hair near the hairline.", "$20"),
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func New() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{"ok": true, "service": "tutt-enterprises-api", "time": time.Now().UTC()})
	})
	mux.HandleFunc("/api/business", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		writeJSON(w, http.StatusOK, business)
	})
	mux.HandleFunc("/api/staff", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"staff": staff})
	})
	mux.HandleFunc("/api/services", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		values := services
		if category := strings.TrimSpace(r.URL.Query().Get("category")); category != "" {
			filtered := []Service{}
			for _, service := range services {
				if service.Category == category {
					filtered = append(filtered, service)
				}
			}
			values = filtered
		}
		writeJSON(w, http.StatusOK, map[string]any{"services": values, "count": len(values)})
	})
	mux.HandleFunc("/api/services/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		id, err := strconv.Atoi(strings.TrimPrefix(r.URL.Path, "/api/services/"))
		if err != nil {
			http.NotFound(w, r)
			return
		}
		for _, service := range services {
			if service.ID == id {
				writeJSON(w, http.StatusOK, service)
				return
			}
		}
		http.NotFound(w, r)
	})
	return logging(mux)
}

func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		started := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(started))
	})
}
