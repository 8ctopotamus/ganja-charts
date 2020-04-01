<?php

function fetch_solactive_data($from, $to) {
  $response = wp_remote_get("https://clients.solactive.com/api/rest/v1/indices/" . SOLACTIVE_API_KEY . "/DE000SLA63U0/history?from=$from&to=$to&resolution=DAY");
  $response['query'] = [
    'from' => $from,
    'to' => $to,
  ];
  return $response;
}