package main

import (
	"github.com/njsatish/tutt-enterprises-portal/backend/internal/api"
	"log"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	address := ":" + port
	log.Printf("Tutt Enterprises API listening on http://localhost%s", address)
	log.Fatal(http.ListenAndServe(address, api.New()))
}
