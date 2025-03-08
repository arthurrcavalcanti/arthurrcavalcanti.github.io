# Variables
$token = "347c6fa9-2cdc-4728-b854-496d9dec716f"
$domain = "arthurrc-server"
$url = "https://www.duckdns.org/update?domains=$domain&token=$token&ip="
$logFile = "$PSScriptRoot\duckdns_update.log"

try {
    # Fetch current public IP address
    $currentIP = (curl ifconfig.me/ip)
    if (!$currentIP) {
        throw "Failed to retrieve the current IP address."
    }
    Write-Output "Ip found => $($currentIP)";
    $updateURL = $url + $currentIP
    $response = Invoke-WebRequest -Uri $updateURL -UseBasicParsing

    Write-Output "$(Get-Date) - Update successful: $response.StatusCode, Response: $($response.Content)"
} catch {
    Write-Error "$(Get-Date) - Update failed: $_"
}
