flower -A inference --port=10000
curl -X POST -d '{"args":["yo"]}' http://localhost:10000/api/task/apply/inference.tasks.generate