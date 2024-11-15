package com.htttdl.StudioCT.dto;

import jakarta.persistence.Column;

import java.util.List;

public class StudioDTO {
    private Long id;
    private String name;
    private String address;
    private double latitude;
    private double longitude;
    private String phone;
    private StudioTypeDTO studioType;
    private double rating;
    private List<ImageDTO> images;
    private WardDTO ward;
    private String thumbnail;
    private StreetDTO street;

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }
// Getters và Setters

    public WardDTO getWard() {
        return ward;
    }

    public void setWard(WardDTO ward) {
        this.ward = ward;
    }

    public StreetDTO getStreet() {
        return street;
    }

    public void setStreet(StreetDTO street) {
        this.street = street;
    }

    public StudioTypeDTO getStudioType() {
        return studioType;
    }

    public void setStudioType(StudioTypeDTO studioType) {
        this.studioType = studioType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }



    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public List<ImageDTO> getImages() {
        return images;
    }

    public void setImages(List<ImageDTO> images) {
        this.images = images;
    }
}
