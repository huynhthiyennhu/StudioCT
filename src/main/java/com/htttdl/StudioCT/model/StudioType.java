package com.htttdl.StudioCT.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "studio_type")
public class StudioType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "studioType", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Studio> studios;

    // Getters and Setters
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

    public List<Studio> getStudios() {
        return studios;
    }

    public void setStudios(List<Studio> studios) {
        this.studios = studios;
    }
}
