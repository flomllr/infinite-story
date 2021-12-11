#! /bin/bash
cat >/etc/prometheus/prometheus.yml <<EOL
# Global config
global:
  scrape_interval:     5s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 2s # Evaluate rules every 15 seconds. The default is every 1 minute.
  scrape_timeout: 3s  # scrape_timeout is set to the global default (10s).

# A scrape configuration containing exactly one endpoint to scrape:# Here it's Prometheus itself.
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: 'prometheus'

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
    - targets: ['localhost:9090']
  - job_name: 'celery'

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
    - targets: ['localhost:9540']
  - job_name: 'redis'

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
    - targets: ['localhost:9121']
  - job_name: 'gunicorn'

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.
    static_configs:
    - targets: ['web.hq.inf:9102']
  - job_name: 'nodes'
    ec2_sd_configs:
      - region: ${region}
        access_key: ${access_key}
        secret_key: ${secret_key}
        port: 9100
    relabel_configs:
        # Only monitor instances with a Name starting with "Nlp" / "Inference" or "API"
      - source_labels: [__meta_ec2_tag_Name]
        regex: Nlp.*|Inference.*|API.*|Frontend.*
        action: keep
        # Use the instance Tag as the instance label
      - source_labels: [__meta_ec2_tag_Name]
        target_label: instance
EOL
cat >/home/ec2-user/init.sh <<EOL
echo "Starting docker..."
sudo systemctl restart docker
sleep 10
echo 'sudo docker run --net=host ovalmoney/celery-exporter "--broker-url=${redis_broker}"' > ~/start-celery-exporter.sh
sudo systemctl restart celery-exporter

echo 'sudo docker run --net=host oliver006/redis_exporter "--redis.addr=${redis_broker}"' > ~/start-redis-exporter.sh
sudo systemctl restart redis-exporter

echo "Starting prometheus..."
systemctl restart prometheus
EOL
su ec2-user <<HEREDOC
bash ~/init.sh
HEREDOC