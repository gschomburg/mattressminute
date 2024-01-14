from PIL import Image, ExifTags, TiffImagePlugin
import os
import json

# def convert_to_dd(latitude_tuple):
#     if latitude_tuple is not None and len(latitude_tuple) == 3:
#         degrees, minutes, seconds = latitude_tuple
#         decimal_degrees = float(degrees) + float(minutes / 60) + float(seconds / 3600)
#         return decimal_degrees
#     return None
# def convert_to_dd2(gps_info):
#     if gps_info is not None:
#         #lat
#         dirNS = gps_info.get(1)
#         degrees, minutes, seconds = gps_info.get(2)
#         lat_decimal_degrees = float(degrees) + float(minutes / 60) + float(seconds / 3600)

#         #long
#         dirEW = gps_info.get(3)
#         degrees2, minutes2, seconds2 = gps_info.get(4)
#         if(dirEW=='W'):
#             degrees2 *= -1
#         long_decimal_degrees = float(degrees2) + float(minutes2 / 60) + float(seconds2 / 3600)
#         return (lat_decimal_degrees, long_decimal_degrees)
#     return None

    # f"{int(abs(degrees2))}°{int(minutes2)},{seconds2.numerator / seconds2.denominator:.1f},{dirEW}"
def seconds_from_minutes(minutes):
    whole_minutes = int(minutes)
    fractional_minutes = minutes - whole_minutes
    return float(fractional_minutes * 60)
def convert_gps_to_dms(gps_info):
    # Return a string like 40°42'14.1"N+73°56'06.0"W
    if gps_info is not None and len(gps_info.get(2)) == 3 and len(gps_info.get(4)) == 3:
        # Latitude
        dirNS = gps_info.get(1)
        degrees, minutes, seconds = gps_info.get(2)
        print('d m s', gps_info.get(2))
        # print(seconds)

        #extract seconds from minutes
        # whole_minutes = int(minutes)
        # fractional_minutes = minutes - whole_minutes
        # calc_seconds = float(fractional_minutes * 60)
        # print('calc seconds:', calc_seconds)
        minute_seconds = seconds_from_minutes(minutes)
        seconds += minute_seconds
        lat = f"{int(abs(degrees))},{int(minutes)},{seconds:.1f},{dirNS}"

        # lat = f"{float(seconds)}"
        # return lat

        # Longitude
        dirEW = gps_info.get(3)
        degrees2, minutes2, seconds2 = gps_info.get(4)
        minute_seconds2 = seconds_from_minutes(minutes2)
        seconds2 += minute_seconds2
        long = f"{int(abs(degrees2))},{int(minutes2)},{seconds2:.1f},{dirEW}"

        # long = f"{int(abs(degrees2))},{int(minutes2)},{seconds2.numerator / seconds2.denominator:.1f},{dirEW}"
        
        val = lat + '+' + long
        return val

    return None

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, TiffImagePlugin.IFDRational):
            return float(obj.numerator) / float(obj.denominator)
        return super().default(obj)

def get_image_metadata(image_path):
    with Image.open(image_path) as img:
        try:
            # Extract EXIF data
            exif_data = img._getexif()
            metadata = {
                "id": os.path.basename(image_path)[:4],
                "filename": os.path.basename(image_path),
                "width": img.width,
                "height": img.height,
                # "format": img.format,
                # "mode": img.mode,
                "date_taken": None,
                "make": None,
                "model": None,
                # "latitude": None,
                # "longitude": None,
                "lat_long_dms":None,
                # Add more metadata fields as needed
            }

            if exif_data is not None:
                # Extract date taken, camera maker, and model from EXIF
                metadata["date_taken"] = exif_data.get(0x9003)  # Date taken
                metadata["make"] = exif_data.get(0x010F)        # Camera maker
                metadata["model"] = exif_data.get(0x0110)       # Camera model

                # Extract GPS data
                GPSTAG = 0x8825
                if GPSTAG in exif_data:
                    gps_info = exif_data[GPSTAG]
                    print("### file:", os.path.basename(image_path))
                    # print("GPS Info:", gps_info)
                if 0x8825 in exif_data and isinstance(exif_data[0x8825], dict):
                    gps_info = exif_data[0x8825]
                    # metadata["lat_long_dms"] = convert_gps_to_dms(gps_info)
                    # metadata["latitude"] = gps_info.get(2)
                    # metadata["longitude"] = gps_info.get(4)
                    if len(gps_info.get(2, [])) == 3 and len(gps_info.get(4, [])) == 3:
                        metadata["lat_long_dms"] = convert_gps_to_dms(gps_info)
                    # metadata["lat_long_dd"] = convert_to_dd2(gps_info)
                    # metadata["latitude_dd"] = convert_to_decimal_degrees(gps_info.get(2))
                    # metadata["longitude_dd"] = convert_to_decimal_degrees(gps_info.get(4))

            return metadata
        except Exception as e:
            print(f"Error processing {image_path}: {e}")
            # Return non-EXIF metadata if an error occurs
            return metadata

def create_json_from_folder(folder_path, output_json_path):
    image_metadata_list = []
    
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
            image_path = os.path.join(folder_path, filename)
            metadata = get_image_metadata(image_path)
            image_metadata_list.append(metadata)

    with open(output_json_path, 'w') as json_file:
        json.dump(image_metadata_list, json_file, indent=2, cls=CustomJSONEncoder)
  
# vars
input_folder = '2024_01_12'
output_json = '2024_01_12_v6.json'

create_json_from_folder(input_folder, output_json)
