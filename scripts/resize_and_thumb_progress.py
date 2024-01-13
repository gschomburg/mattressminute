from PIL import Image, ExifTags
import os
from tqdm import tqdm

def calculate_resized_size(original_size, max_dimension):
    width, height = original_size
    aspect_ratio = width / height

    if width > height:
        new_width = min(width, max_dimension)
        new_height = int(new_width / aspect_ratio)
    else:
        new_height = min(height, max_dimension)
        new_width = int(new_height * aspect_ratio)

    return new_width, new_height

def process_image(input_folder, output_folder, filename, max_dimension, thumbnail_max_size):
    original_path = os.path.join(input_folder, filename)
    output_path = os.path.join(output_folder, filename)
    thumb_output_path = os.path.join(output_folder, "thumbnails", "t_" + filename)
    with Image.open(original_path) as img:
        # Calculate resized size
        resized_size = calculate_resized_size(img.size, max_dimension)

        # Resize the image
        resized_img = img.resize(resized_size)

        # Save the resized image with EXIF data
        original_exif = resized_img.info.get('exif')  # Get the EXIF data from the info attribute
        if original_exif is not None:
            resized_img.save(output_path, exif=original_exif)
        else:
            resized_img.save(output_path)

        # Check if the image needs resizing before applying thumbnail scaling
        if img.size[0] > thumbnail_max_size or img.size[1] > thumbnail_max_size:
            thumbnail_size = calculate_resized_size(img.size, thumbnail_max_size)

            # Create and save a thumbnail with a prefix in the 'thumbnails' subfolder
            thumbnail_img = img.resize(thumbnail_size)

            # Check if the image has Exif data AND rotate thumb to orientation
            if hasattr(img, '_getexif') and img._getexif() is not None:
                # Retrieve the Exif data
                exif_data = dict(img._getexif().items())

                # Get the orientation tag (if available)
                orientation = exif_data.get(274)
                # Rotate the image based on the orientation tag
                if orientation == 3:
                    thumbnail_img = thumbnail_img.rotate(180, expand=True)
                elif orientation == 6:
                    thumbnail_img = thumbnail_img.rotate(270, expand=True)
                elif orientation == 8:
                    thumbnail_img = thumbnail_img.rotate(90, expand=True)

            # rotate to orientation
            # thumbnail_output_path = output_path.replace('batched', 'batched/thumbnails')  # Adjust the path for thumbnails
            thumbnail_img.save(thumb_output_path)

def resize_and_create_thumbnail(input_folder, output_folder, max_dimension, thumbnail_max_size):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    thumbnail_folder = os.path.join(output_folder, 'thumbnails')
    if not os.path.exists(thumbnail_folder):
        os.makedirs(thumbnail_folder)

    for filename in tqdm(os.listdir(input_folder), desc='Processing Images', unit='image'):
        if filename.lower().endswith(('.jpg', '.jpeg')):
            # image_path = os.path.join(input_folder, filename)
            # output_path = os.path.join(output_folder, filename)

            try:
                process_image(input_folder, output_folder, filename, max_dimension, thumbnail_max_size)
            except Exception as e:
                print(f"Error processing {filename}: {str(e)}")
                continue

# Example usage:
input_folder = 'test'
output_folder = 'batched'
max_dimension = 2000  # Set your desired maximum dimension
thumbnail_max_size = 100  # Set your desired maximum size for thumbnails

resize_and_create_thumbnail(input_folder, output_folder, max_dimension, thumbnail_max_size)
