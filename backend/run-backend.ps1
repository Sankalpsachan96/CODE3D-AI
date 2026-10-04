# CODE3D AI - Spring Boot Backend Launcher
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Starting CODE3D AI Backend (Spring Boot + JavaParser)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$backendDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $backendDir

$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.12"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "Using Java: " -NoNewline
java -version

& ".\mvnw.cmd" spring-boot:run
