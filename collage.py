import bpy
import os
import poisson
import numpy as np
import math
import random
import colorsys

obj_path = os.path.join(".", "App/obj")

def import_models(obj_path):
    models = os.listdir(obj_path)
    print("Found {} models.".format(len(models)))
    for model in models:
        bpy.ops.import_scene.obj(filepath=os.path.join(obj_path, model), 
                                 axis_forward='-Z',
                                 axis_up='Y',
                                 filter_glob="*.obj")


limit_radius = 9
objects = bpy.context.visible_objects
objects = list(filter(lambda o: "hsl" in o.name, objects))
print("# object: {}".format(len(objects)))
samples = poisson.poisson_disc_samples(width=len(objects) / limit_radius,
                                       height=len(objects) / limit_radius,
                                       r=1.38)
print("# samples: {}".format(len(samples)))
samples_x = list(map(lambda s: s[0], samples))
samples_y = list(map(lambda s: s[1], samples))
max_x = np.max(samples_x)
max_y = np.max(samples_y)

material = bpy.data.materials.get("Material")

for i, object in enumerate(objects):
    sample = samples[i]
    color = str(object).split("--")[1]
    color = color.replace("hsl(", "").replace(")\")>", "").replace("%", "")
    color = color.split(",")
    hue = float(color[0])
    print(hue)
    color_rgb = colorsys.hls_to_rgb(hue, 0.92, 0.90)
    x = sample[0] / 2 - max_x / 4
    y = sample[1] / 2 - max_y / 4
    dist = np.linalg.norm(np.array([x, y]))
    count = 0
    while dist >= limit_radius:
        sample = samples[i + count]
        x = sample[0] / 2 - max_x / 4
        y = sample[1] / 2 - max_y / 4
        dist = np.linalg.norm(np.array([x, y]))
        count += 1
        if count > 10:
            break
    random_size = random.uniform(-0.05, 0.05)
    object.scale.x = 0.15 + random_size 
    object.scale.y = 0.15 + random_size
    object.scale.z = 0.15 + random_size
    object.location.x = x
    object.location.y = y
    #material.diffuse_color.r = 
    object.data.materials.clear()
    object.data.materials.append(material)
