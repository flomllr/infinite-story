# Infinite Story
The entire source code of the Infinite Story app (Server + client) that ran from end of 2019 to beginning of 2021.

No support whatsoever will be given.

Deploying the infra requires AMI images that we do not provide. All the server code is provided in `infinite-story/server`, which means it should be possible to recreate those AMI or make the deployment process simpler (this was made for having thousands of users playing simulatneously).

The model can be found here: bit.ly/infinite-story-model 
You'll need a tensorflow-model-serve exposing the model in the link above. The celery task that runs the inference requests coming from the python server will query the tf server using grpc:
```python
    # infinite-story/server/gpt2/gpt2_generator_savedmodel.py 
    # setting up the grpc channel and stub:
    def init():
        self.hostport = "0.0.0.0:8500"
        self.channel = grpc.insecure_channel(self.hostport)
        self.stub = prediction_service_pb2_grpc.PredictionServiceStub(
        self.channel)
    def generate_raw(self, prompt):
        context_tokens = self.enc.encode(prompt)
        request = predict_pb2.PredictRequest()
        request.model_spec.name = 'generator'
        request.inputs['context'].CopyFrom(make_tensor_proto([
            context_tokens]))
        result = self.stub.Predict(request, 20.0)  # 10 seconds
        out = result.outputs['output'].int_val[len(context_tokens):]

        text = self.enc.decode(out)
        return text
```
