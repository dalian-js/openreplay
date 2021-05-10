CREATE TABLE sy_navigations
(
    run_id                         UInt32,
    test_id                        UInt32,
    tenant_id                      UInt32,
    name                           String,
    steps_count                    UInt32,
    location                       Enum8('local'=-2,'europe-west1-d'=-1,'us-east-2'=0, 'us-east-1'=1, 'us-west-1'=2, 'us-west-2'=3, 'af-south-1'=4, 'ap-east-1'=5, 'ap-south-1'=6, 'ap-northeast-3'=7, 'ap-northeast-2'=8, 'ap-southeast-1'=9, 'ap-southeast-2'=10, 'ap-northeast-1'=11, 'ca-central-1'=12, 'eu-central-1'=13, 'eu-west-1'=14, 'eu-west-2'=15, 'eu-south-1'=16, 'eu-west-3'=17, 'eu-north-1'=18, 'me-south-1'=19, 'sa-east-1'=20),
    state                          Enum8('passed'=0,'failed'=1),
    failure_message                Nullable(String),
    datetime                       DateTime,
    browser                        String,
    device_type                    Enum8('other'=0, 'desktop'=1, 'mobile'=2,'tablet'=3),
    duration                       UInt32,
    device                         Nullable(String),

    start_time                     UInt16,
    url                            String,
    url_host                       Nullable(String) MATERIALIZED lower(domain (url)),
    url_path                       Nullable(String) MATERIALIZED lower(pathFull(url)),
    load_event_start               Nullable(UInt32),
    load_event_end                 Nullable(UInt16),

    request_start                  UInt16,
    load_event_time                Nullable(UInt16) MATERIALIZED minus(load_event_end, start_time),
    response_start                 UInt16,
    response_end                   UInt16,
    response_time                  Nullable(UInt8) MATERIALIZED minus(response_end, response_start),

    dom_content_loaded_event_start Nullable(UInt16),
    dom_content_loaded_event_end   Nullable(UInt16),
    dom_content_loaded_event_time  Nullable(UInt16) MATERIALIZED minus(dom_content_loaded_event_end, start_time),
    dom_build_time                 Nullable(UInt8) MATERIALIZED minus(dom_content_loaded_event_start, response_end),
    secure_connection_start        Nullable(UInt16),
    connect_start                  UInt16,
    connect_end                    UInt16,
    ssl_time                       Nullable(UInt8) MATERIALIZED if (greater(secure_connection_start, 0),
        minus(connect_end, secure_connection_start), NULL),
    tcp_time                       Nullable(UInt8) MATERIALIZED if (greater(connect_start, 0),
        minus(connect_end, connect_start), NULL),
    encoded_body_size              Nullable(UInt32),
    decoded_body_size              Nullable(UInt32),
    compression_ratio              Nullable(Float32) MATERIALIZED if (greater(encoded_body_size, 0),
        divide(decoded_body_size, encoded_body_size),
        Null),
    domain_lookup_start            UInt16,
    domain_lookup_end              UInt16,
    dns_time                       Nullable(UInt8) MATERIALIZED if (greater(domain_lookup_end, domain_lookup_start),
        minus(domain_lookup_end, domain_lookup_start), Null),
    redirect_start                 UInt16,
    redirect_end                   UInt16,
    redirect_count                 UInt8,
    redirect_time                  Nullable(UInt8) MATERIALIZED if (greater(redirect_end, redirect_start),
        minus(redirect_end, redirect_start), Null),
    ttfb                           Nullable(UInt8) MATERIALIZED minus(response_start, request_start)
) ENGINE = MergeTree
      PARTITION BY toDate(datetime)
      ORDER BY (test_id, run_id, datetime)
      TTL datetime + INTERVAL 1 MONTH;