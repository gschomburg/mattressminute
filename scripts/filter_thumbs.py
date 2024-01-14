import os
import shutil

def move_matching_thumbnails(image_folder, thumbnail_folder, output_folder):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for image_filename in os.listdir(image_folder):
        if image_filename.lower().endswith(('.jpg', '.jpeg')):
            # Construct paths for image and thumbnail
            # image_path = os.path.join(image_folder, image_filename)
            thumbnail_filename = f"t_{image_filename}"
            thumbnail_path = os.path.join(thumbnail_folder, thumbnail_filename)

            # Check if thumbnail exists
            if os.path.exists(thumbnail_path):
                # Move the thumbnail to the output folder
                output_path = os.path.join(output_folder, thumbnail_filename)
                shutil.move(thumbnail_path, output_path)
                print(f"Moved thumbnail: {thumbnail_filename} to {output_folder}")

# Example usage:
image_folder = '2024_01_12'
thumbnail_folder = '2024_01_12/thumbnails'
output_folder = '2024_01_12/thumbnails_found'

move_matching_thumbnails(image_folder, thumbnail_folder, output_folder)
