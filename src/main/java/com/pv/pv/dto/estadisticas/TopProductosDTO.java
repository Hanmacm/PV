package com.pv.pv.dto.estadisticas;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TopProductosDTO {
    private List<String> n;
    private List<Long> q;
}
