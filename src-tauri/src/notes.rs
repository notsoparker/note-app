use std::fs;
use std::path::PathBuf;

fn sanatize_filename(name: &str) -> String {
    name.chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
            _ => c,
        })
        .collect::<String>()
        .trim_end_matches(['.', ' '])
        .to_string()
}

#[tauri::command]
pub fn save_note(text: String) -> Result<String, String> {
    let first_line = text.lines().next().unwrap_or("").trim();
    let display_title = if first_line.is_empty() { "Untitled" } else { first_line };
    let safe_title = sanatize_filename(display_title);

    let dir = PathBuf::from("notes");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

    let mut candidate = dir.join(format!("{}.md", safe_title));
    let mut counter = 1;
    while candidate.exists() {
        candidate = dir.join(format!("{} ({}).md", safe_title, counter));
        counter += 1;
    }

    fs::write(&candidate, &text).map_err(|e| e.to_string())?;

    Ok(display_title.to_string())
}