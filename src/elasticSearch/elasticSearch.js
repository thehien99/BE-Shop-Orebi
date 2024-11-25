const { Client } = require('@elastic/elasticsearch');

// Tạo client Elasticsearch
const elasticClient = new Client({
  node: 'https://a7405133c6754e478cfc90ec69cba7de.us-central1.gcp.cloud.es.io:443',
  auth: {
    username: 'elastic', // Username mặc định
    password: 'gK4u5lLMG5IMGAHgZsYajyi9', // Password bạn lưu
  },
});



module.exports = elasticClient;
