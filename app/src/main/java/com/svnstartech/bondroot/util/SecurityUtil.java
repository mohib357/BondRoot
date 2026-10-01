package com.svnstartech.bondroot.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

/**
 * Production-grade Security & Authentication Utility for BondRoot.
 *
 * Implements NIST-compliant PBKDF2 (PBKDF2WithHmacSHA256) with 100,000 iterations
 * and cryptographically secure random salts. This protects local database credentials
 * against GPU-accelerated dictionary and brute-force attacks if the local database
 * is ever extracted from device storage.
 *
 * Server-side specification: Argon2id is specified for backend PostgreSQL authentication.
 */
public class SecurityUtil {

    private static final String PBKDF2_ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final int ITERATIONS = 100000;
    private static final int KEY_LENGTH = 256;
    private static final int SALT_LENGTH = 16;

    /**
     * Generates a cryptographically secure random salt in hex.
     */
    public static String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[SALT_LENGTH];
        random.nextBytes(salt);
        return bytesToHex(salt);
    }

    /**
     * Hashes password using PBKDF2 with HMAC-SHA256 (100,000 iterations).
     * Output format: pbkdf2:100000:<salt_hex>:<hash_hex>
     */
    public static String hashPassword(String plaintextPassword) {
        if (plaintextPassword == null || plaintextPassword.isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        String saltHex = generateSalt();
        byte[] salt = hexToBytes(saltHex);
        String hashHex = computePBKDF2(plaintextPassword.toCharArray(), salt, ITERATIONS, KEY_LENGTH);
        return "pbkdf2:" + ITERATIONS + ":" + saltHex + ":" + hashHex;
    }

    /**
     * Verifies password against stored hash.
     * Supports:
     * 1. Modern PBKDF2: "pbkdf2:iterations:saltHex:hashHex"
     * 2. Transition SHA-256: "saltHex:hashHex"
     * 3. Legacy plaintext fallback for automatic migration
     */
    public static boolean verifyPassword(String plaintextPassword, String storedValue) {
        if (plaintextPassword == null || storedValue == null) {
            return false;
        }

        // Modern PBKDF2 format: pbkdf2:<iterations>:<saltHex>:<hashHex>
        if (storedValue.startsWith("pbkdf2:")) {
            String[] parts = storedValue.split(":", 4);
            if (parts.length == 4) {
                int iterations = Integer.parseInt(parts[1]);
                byte[] salt = hexToBytes(parts[2]);
                String expectedHash = parts[3];
                String computedHash = computePBKDF2(plaintextPassword.toCharArray(), salt, iterations, KEY_LENGTH);
                return slowEquals(expectedHash, computedHash);
            }
        }

        // Transition salted SHA-256 format: <saltHex>:<hashHex>
        if (storedValue.contains(":")) {
            String[] parts = storedValue.split(":", 2);
            if (parts.length == 2) {
                String salt = parts[0];
                String expectedHash = parts[1];
                String computed = computeLegacySha256(plaintextPassword, salt);
                return slowEquals(expectedHash, computed);
            }
        }

        // Legacy fallback
        return storedValue.equals(plaintextPassword);
    }

    private static String computePBKDF2(char[] password, byte[] salt, int iterations, int keyLength) {
        try {
            KeySpec spec = new PBEKeySpec(password, salt, iterations, keyLength);
            SecretKeyFactory factory = SecretKeyFactory.getInstance(PBKDF2_ALGORITHM);
            byte[] hash = factory.generateSecret(spec).getEncoded();
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException("PBKDF2 computation failed", e);
        }
    }

    private static String computeLegacySha256(String password, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt.getBytes(StandardCharsets.UTF_8));
            byte[] hashed = md.digest(password.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private static byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }

    /**
     * Constant-time string comparison to prevent side-channel timing attacks.
     */
    private static boolean slowEquals(String a, String b) {
        if (a == null || b == null) return false;
        int diff = a.length() ^ b.length();
        for (int i = 0; i < a.length() && i < b.length(); i++) {
            diff |= a.charAt(i) ^ b.charAt(i);
        }
        return diff == 0;
    }
}
