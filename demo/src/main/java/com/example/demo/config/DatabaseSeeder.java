package com.example.demo.config;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            System.out.println("Seeding database...");
            productRepository.saveAll(List.of(
                    new Product(null, "Laptop", "High performance laptop", 1200.00),
                    new Product(null, "Smartphone", "Latest model smartphone", 800.00),
                    new Product(null, "Headphones", "Noise cancelling headphones", 150.00)
            ));
            System.out.println("Database seeded successfully.");
        } else {
            System.out.println("Database already contains data, skipping seeding.");
        }
    }
}
