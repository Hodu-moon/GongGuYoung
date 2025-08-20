package xyz.jinjin99.gongguyoung.backend.global.utils;

import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;


@Component
public class PasswordUtil {
    public String encodeSHA256(String rawPassword) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(rawPassword.getBytes());
            return Base64.getEncoder().encodeToString(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 Algorithm not found", e);
        }
    }

    public boolean matches(String rawPassword, String encodedPassword) {
        String hashed = encodeSHA256(rawPassword);
        return hashed.equals(encodedPassword);
    }
}
