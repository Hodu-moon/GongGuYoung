package xyz.jinjin99.gongguyoung.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${fin-open.api.base-url}")
    private String finOpenApi;

    @Bean
    public RestClient finOpenApiRestClient() {
        return RestClient.builder()
                .baseUrl(finOpenApi)
                .build();
    }
}