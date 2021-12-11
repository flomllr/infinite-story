from gpt2 import gpt2_generator_savedmodel

if __name__ == "__main__":
        GPT2 = gpt2_generator_savedmodel.GPT2GeneratorSavedModel()
        print(GPT2.generate("Warmup ...", no_loop=True))
