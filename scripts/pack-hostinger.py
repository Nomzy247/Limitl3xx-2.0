import os
import zipfile
import shutil

dist_dir = os.path.abspath("dist")
zip_path = os.path.join(dist_dir, "hostinger-deploy.zip")
public_zip_path = os.path.abspath("public/hostinger-deploy.zip")

if os.path.exists(zip_path):
    os.remove(zip_path)

with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            if file == "hostinger-deploy.zip":
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, dist_dir)
            zf.write(full_path, rel_path)

size_mb = os.path.getsize(zip_path) / (1024 * 1024)
print(f"Successfully generated hostinger-deploy.zip ({size_mb:.2f} MB)")

os.makedirs(os.path.dirname(public_zip_path), exist_ok=True)
shutil.copyfile(zip_path, public_zip_path)
print(f"Copied package to {public_zip_path}")
