package main

import (
	"github.com/njsatish/high-quality-barbershop/backend/internal/api"
	"log"
	"net/http"
)

func main() {
	address := ":8080"
	log.Printf("HQ Barbershop API listening on http://localhost%s", address)
	log.Fatal(http.ListenAndServe(address, api.New()))
}
