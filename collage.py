import bpy
import os
import poisson

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
for object in objects:
    object.scale.x = 0.1
    object.scale.y = 0.1
    object.scale.z = 0.1

bpy.context.visible_objects[0].location.x = 0
bpy.context.visible_objects[0].location.y = 0
                             
#print(poisson_disc_samples(width=100, height=100, r=10))