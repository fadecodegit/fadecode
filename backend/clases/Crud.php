<?php

interface Crud {
    public function crear(array $datos): bool;
    public function leer(int $id): array;
    public function listar(): array;
    public function actualizar(int $id, array $datos): bool;
    public function eliminar(int $id): bool;
}
