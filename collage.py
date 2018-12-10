import bpy
import os
import poisson
import numpy as np
import math

obj_path = os.path.join(".", "App/obj")

def import_models(obj_path):
    models = os.listdir(obj_path)
    print("Found {} models.".format(len(models)))
    for model in models:
        bpy.ops.import_scene.obj(filepath=os.path.join(obj_path, model), 
                                 axis_forward='-Z',
                                 axis_up='Y',
                                 filter_glob="*.obj")


objects = bpy.context.visible_objects
objects = list(filter(lambda o: "hsl" in o.name, objects))
print("# object: {}".format(len(objects)))
samples = poisson.poisson_disc_samples(width=len(objects) / 10,
                                       height=len(objects) / 10,
                                       r=12 / 10)
print("# samples: {}".format(len(samples)))
samples_x = list(map(lambda s: s[0], samples))
samples_y = list(map(lambda s: s[1], samples))
max_x = np.max(samples_x)
max_y = np.max(samples_y)
for i, object in enumerate(objects):
    dir(object)
    sample = samples[i]
    object.scale.x = 0.1
    object.scale.y = 0.1
    object.scale.z = 0.1
    object.location.x = sample[0] / 2 - max_x / 4
    object.location.y = sample[1] / 2 - max_y / 4
    
    