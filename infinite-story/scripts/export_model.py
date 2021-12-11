import tensorflow as tf
from gpt2.gpt2_generator import *
generator = GPT2Generator()
model = generator.output

# Save the model to a .pb file
MODEL_DIR = "/home/ec2-user/saved"
version = 1
export_path = os.path.join(MODEL_DIR, str(version))
tf.saved_model.simple_save(generator.sess, export_path,
inputs={"context": generator.context}, outputs={"output":
generator.output})
