use std::env;
use std::fs;
use std::path::Path;

fn main() {
    let out_dir = env::var("OUT_DIR").unwrap();
    let target_dir = Path::new(&out_dir).parent().unwrap().parent().unwrap().parent().unwrap();
    
    // Copy assets directory to target directory
    let src_assets = "src/assets";
    let dest_assets = target_dir.join("assets");
    
    if dest_assets.exists() {
        fs::remove_dir_all(&dest_assets).unwrap();
    }
    
    copy_dir_recursive(src_assets, &dest_assets).unwrap();
    
    println!("cargo:rerun-if-changed=src/assets");
}

fn copy_dir_recursive(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> std::io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_recursive(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
} 