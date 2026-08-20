# Thapar-rental-
# ThaparRent

### A Trusted Campus Rental & Resource Sharing Platform for Thapar Students

ThaparRent is a full-stack web platform designed to make it easier for verified Thapar students to discover, rent, and share eligible campus resources.

The platform focuses on creating a safer and more structured alternative to informal student-to-student rental arrangements by providing student verification, item listings, rental workflows, transaction records, condition documentation, and reporting mechanisms.

---

## 🚀 Project Status

**Status:** Under Active Development

This project is being developed as a Software Engineering project for Thapar Institute of Engineering & Technology.

The current version is based on an existing full-stack CampusRent codebase that is being extensively adapted, redesigned, and extended for the Thapar campus environment.

---

# 📌 Problem Statement

Students frequently need items for short periods of time but may not want to purchase them permanently.

Examples include:

- Textbooks
- Calculators
- Sports equipment
- Cycles and accessories
- Lab-related resources
- Hostel-related items
- Other eligible campus resources

Currently, students often depend on:

- WhatsApp groups
- Personal contacts
- Informal messaging
- Social media groups

These approaches provide limited:

- Student verification
- Item information
- Availability tracking
- Rental records
- Condition documentation
- Trust mechanisms
- Reporting facilities

ThaparRent aims to provide a centralized and structured platform for eligible campus resources.

---

# 🎯 Objectives

The main objectives of ThaparRent are:

- Provide a centralized campus rental platform.
- Allow verified Thapar students to create and browse listings.
- Make rental availability easier to discover.
- Maintain structured rental and transaction records.
- Reduce risks associated with informal transactions.
- Provide item condition documentation before and after rentals.
- Introduce trust and reporting mechanisms.
- Provide a scalable architecture that can later support institutional or approved-provider participation.

---

# 👥 Target Users

## Students

Students can:

- Create verified accounts.
- Browse available resources.
- Search and filter listings.
- View item details.
- Request rentals.
- Manage their rentals.
- List eligible items.
- Communicate with other users.
- Report suspicious listings or issues.

## Administrators / Moderators

Administrators can eventually:

- Review reported listings.
- Manage inappropriate content.
- Review flagged users.
- Manage restricted categories.
- Monitor platform activity.
- Handle exceptional disputes according to platform policies.

## Future Campus Partners

The platform may later support:

- Approved campus vendors
- Departments
- Student organizations
- Campus facilities

---

# ✨ Key Features

## 1. Student Authentication

Students can create accounts using their institutional email.

Features include:

- Student email validation
- Password validation
- Secure authentication
- JWT-based sessions
- Protected routes

---

## 2. User Profiles

Users can maintain profiles containing relevant information such as:

- Name
- Campus email
- Profile information
- Rental activity
- Listing history
- Trust/reputation information

---

## 3. Marketplace

Students can browse available listings.

Each listing can contain:

- Item name
- Description
- Category
- Condition
- Daily rental price
- Security deposit
- Retail price
- Minimum rental duration
- Pickup location
- Images
- Availability

---

## 4. Search & Filtering

Users can search for resources based on:

- Item name
- Category
- Price
- Condition
- Availability
- Pickup zone

Future versions may include smarter recommendations.

---

# 🔄 Rental Lifecycle

ThaparRent is designed around a structured rental lifecycle:

```text
Browse
   ↓
View Item
   ↓
Request Rental
   ↓
Owner Accepts
   ↓
Handover
   ↓
Active Rental
   ↓
Return
   ↓
Condition Verification
   ↓
Transaction Completed

