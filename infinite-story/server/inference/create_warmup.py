import tensorflow as tf
from tensorflow_serving.apis import classification_pb2
from tensorflow_serving.apis import inference_pb2
from tensorflow_serving.apis import model_pb2
from tensorflow_serving.apis import predict_pb2
from tensorflow_serving.apis import prediction_log_pb2
from tensorflow.contrib.util import make_tensor_proto
from tensorflow_serving.apis import regression_pb2

def main():
    with tf.python_io.TFRecordWriter("tf_serving_warmup_requests") as writer:
        request = predict_pb2.PredictRequest()
        request.model_spec.name = '1'
        request.inputs['context'].CopyFrom(make_tensor_proto([[
            1,2,4,6,7]]))
        log = prediction_log_pb2.PredictionLog(
            predict_log=prediction_log_pb2.PredictLog(request=request))
        writer.write(log.SerializeToString())

if __name__ == "__main__":
    main()
