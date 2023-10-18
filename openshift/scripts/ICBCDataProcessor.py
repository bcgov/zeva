import tkinter as tk
from tkinter import filedialog
import os
import time
import csv
import threading


class DataProcessingApp(tk.Tk):
    def __init__(self, *args, **kwargs):
        tk.Tk.__init__(self, *args, **kwargs)

        self.winfo_toplevel().title('ICBC Data Processor')
        self.geometry("800x600")
        self.frame = tk.Frame(self, background='white')
        self.frame.pack(side="top", fill="both", expand=True)

        self.label = tk.Label(self, text="ICBC Data Processor",
                              foreground="white",
                              background="#003366",
                              height=3,
                              font=('Helvetica', 24))

        self.loading_label = tk.Label(self, text='', foreground='black', background="white", font=('Helvetica', 20))

        process_button = tk.Button(self, text='Upload ICBC File', command=self.uploadAction, height=3, width=20)

        self.footer = tk.Frame(self, background='#003366', height=80)

        self.label.pack(in_=self.frame, fill='x')
        self.loading_label.pack(in_=self.frame, fill='x')
        process_button.pack(in_=self.frame)
        self.footer.pack(in_=self.frame, side='bottom', fill='x')

    def uploadAction(self):
        originalfilename = filedialog.askopenfilename()

        if originalfilename and not isinstance(originalfilename, tuple):
            self.loading_label.config(text='Processing...', height=5)
            self.loading_label.update_idletasks()

            threading.Thread(target=self.processFile, args=(originalfilename,)).start()
        
        else:
            self.loading_label.config(text='Could not read file please try again', height=5)
            self.loading_label.update_idletasks()

    def processFile(self, originalfilename):
        
        filename, file_extension = os.path.splitext(originalfilename)

        with open(originalfilename, 'r') as read_csvfile, \
        open(filename + '_processed' + file_extension, 'w', newline='') as write_csvfile:

            reader = csv.DictReader(read_csvfile, delimiter='|')
            writer = csv.DictWriter(write_csvfile, fieldnames=['MODEL_YEAR', 'MAKE', 'MODEL', 'VIN'])
            writer.writeheader()

            for row in reader:
                row = {k.upper(): v for k, v in row.items()}
                vin = row.get('VIN', '').strip()
                model_year = row.get('MODEL_YEAR', '').strip()
                hybrid_flag = row.get('HYBRID_VEHICLE_FLAG', 'N').strip().upper()
                electric_flag = row.get('ELECTRIC_VEHICLE_FLAG', 'N').strip().upper()
                fuel_type = row.get('FUEL_TYPE', '').strip().upper()

                if vin and model_year.isdigit() and int(model_year) > 2018 and \
                    (hybrid_flag != 'N' or electric_flag != 'N' or fuel_type in ['ELECTRIC', 'HYDROGEN', 'GASOLINEELECTRIC']):
                    writer.writerow({
                        'MODEL_YEAR': model_year,
                        'MAKE': row.get('MAKE', '').strip(),
                        'MODEL': row.get('MODEL', '').strip(),
                        'VIN': vin
                    })

        self.loading_label.config(text='ICBC Data File Processed!')


def main():
    app = DataProcessingApp()
    app.mainloop()
    return 0


if __name__ == '__main__':
    main()