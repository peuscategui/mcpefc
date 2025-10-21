#!/bin/bash
# Script para probar la conectividad desde Portainer al SQL Server

echo "🔍 Probando conectividad desde Portainer..."

# Test 1: Verificar resolución DNS
echo "📍 Test 1: Resolución DNS"
nslookup SURDBP04
echo ""

# Test 2: Verificar conectividad de red
echo "🌐 Test 2: Conectividad de red"
ping -c 3 SURDBP04
echo ""

# Test 3: Verificar puerto SQL Server
echo "🔌 Test 3: Puerto SQL Server (1433)"
nc -zv SURDBP04 1433
echo ""

# Test 4: Verificar Node.js
echo "📦 Test 4: Node.js instalado"
node --version
echo ""

# Test 5: Verificar dependencias
echo "📚 Test 5: Dependencias npm"
npm list --depth=0
echo ""

echo "✅ Pruebas completadas"
