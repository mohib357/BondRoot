package com.svnstartech.bondroot.model;

import java.io.Serializable;

/**
 * Representing an authenticated user account.
 * Separation of concerns:
 * User Account ≠ Person
 * A user account is linked to exactly one Person record via linkedPersonId.
 * But the database can contain thousands of Person records (deceased, ancestors, relatives)
 * who do not possess a user account.
 */
public class UserAccount implements Serializable {
    private String userId;          // Unique User/Auth ID, e.g. "U10001"
    private String email;           // Login email
    private String password;        // Password
    private String linkedPersonId;  // Foreign reference to Person.personId
    private String role;            // "USER", "ADMIN"
    private long createdAt;

    public UserAccount() {
        this.role = "USER";
        this.createdAt = System.currentTimeMillis();
    }

    public UserAccount(String userId, String email, String password, String linkedPersonId) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.linkedPersonId = linkedPersonId;
        this.role = "USER";
        this.createdAt = System.currentTimeMillis();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getLinkedPersonId() {
        return linkedPersonId;
    }

    public void setLinkedPersonId(String linkedPersonId) {
        this.linkedPersonId = linkedPersonId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }
}
