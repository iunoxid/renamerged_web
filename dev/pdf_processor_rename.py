import os
from src.utils.utils import log_message, Fore
from src.pdf.pdf_utils import validate_pdf, extract_info_from_pdf, generate_filename, copy_file_with_unique_name

def process_pdfs(input_directory, output_directory=None, progress_callback=None, log_callback=None, settings=None, cancel_flag=None):
    """Memproses file PDF dengan mode Rename Saja."""
    if output_directory is None or output_directory.strip() == "":
        output_directory = os.path.join(input_directory, "ProcessedPDFs")
    os.makedirs(output_directory, exist_ok=True)

    # Tahap 1: Perhitungan file PDF
    pdf_files = [f for f in os.listdir(input_directory) if f.endswith('.pdf')]
    total_files = len(pdf_files)
    log_message(f"Total file ditemukan: {total_files}", Fore.CYAN, log_callback=log_callback)

    # Inisialisasi variabel statistik
    processed_files = 0
    error_files = 0
    renamed_files = 0
    merged_files = 0

    # Ambil urutan komponen dan opsi pemisah dari pengaturan
    component_order = settings.get("component_order", None)
    separator = settings.get("separator", "-")
    slash_replacement = settings.get("slash_replacement", "_")

    # Proses setiap file secara independen
    for filename in pdf_files:
        # Check for cancellation
        if cancel_flag and cancel_flag.is_set():
            log_message("🛑 Proses dibatalkan oleh user", Fore.YELLOW, log_callback=log_callback)
            break
            
        pdf_path = os.path.join(input_directory, filename)
        if not validate_pdf(pdf_path):
            error_files += 1
            log_message(f"⚠️ File {filename} korup atau tidak valid, dilewati.", Fore.YELLOW, log_callback=log_callback)
            continue

        try:
            id_tku_seller, partner_name, faktur_number, date, reference = extract_info_from_pdf(pdf_path, log_callback)

            if partner_name == "Nama tidak ditemukan":
                log_message(f"⚠️ Nama tidak ditemukan di {filename}, dilewati.", Fore.YELLOW, log_callback=log_callback)
                continue

            # Buat folder berdasarkan ID TKU dengan race condition protection
            idtku_folder = os.path.join(output_directory, id_tku_seller)
            try:
                os.makedirs(idtku_folder, exist_ok=True)
            except (OSError, FileExistsError) as e:
                # Handle race condition where folder is created by another process
                if not os.path.isdir(idtku_folder):
                    log_message(f"⚠️ Error creating folder {idtku_folder}: {str(e)}", Fore.YELLOW, log_callback=log_callback)
                    # Try alternative path
                    idtku_folder = os.path.join(output_directory, f"{id_tku_seller}_alt")
                    os.makedirs(idtku_folder, exist_ok=True)

            # Buat nama file berdasarkan pengaturan
            max_length = settings.get("max_filename_length", None)
            new_filename = generate_filename(partner_name, faktur_number, date, reference, settings, component_order, separator, slash_replacement, max_length)
            destination_path = os.path.join(idtku_folder, new_filename)

            # Salin file dengan nama unik
            renamed_files += copy_file_with_unique_name(pdf_path, destination_path, log_callback)

        except Exception as e:
            error_files += 1
            log_message(f"❌ Error membaca {filename}: {str(e)}", Fore.RED, log_callback=log_callback)

        processed_files += 1
        if progress_callback:
            progress_callback("reading", processed_files, total_files, 0, 0)

    # Hitung total file yang akan difinalisasi
    total_to_finalize = renamed_files
    processed_files_for_finalizing = 0

    # Tahap 2: Finalisasi
    if progress_callback:
        progress_callback("finalizing", 0, total_files, 0, total_to_finalize)

    for _ in range(total_to_finalize):
        # Check for cancellation
        if cancel_flag and cancel_flag.is_set():
            break
            
        processed_files_for_finalizing += 1
        if progress_callback:
            progress_callback("finalizing", processed_files_for_finalizing, total_files, 0, total_to_finalize)
    
    # Ensure final progress callback shows 100%
    if progress_callback and not (cancel_flag and cancel_flag.is_set()):
        progress_callback("finalizing", total_to_finalize, total_files, 0, total_to_finalize)

    # Log hasil akhir
    log_message("\n📊 Hasil Akhir:", Fore.CYAN, log_callback=log_callback)
    log_message(f"📝 Total file diproses   : {total_files}", Fore.CYAN, log_callback=log_callback)
    log_message(f"📂 File yang hanya diganti nama: {renamed_files}", Fore.BLUE, log_callback=log_callback)
    log_message(f"✅ File yang diganti nama dan digabung: {merged_files}", Fore.GREEN, log_callback=log_callback)
    log_message(f"❌ Total error           : {error_files}\n", Fore.RED, log_callback=log_callback)
    log_message("✨ Selesai", Fore.GREEN, log_callback=log_callback)

    return total_files, renamed_files, merged_files, error_files