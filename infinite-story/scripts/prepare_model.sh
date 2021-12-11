# On an inference machine with TensorRT setup
pipenv run python tensorrt.py --input_model_dir=$HOME/saved/1 --output_model_dir=$HOME/saved/1_optimized --batch_size=1 --precision_mode="FP16"