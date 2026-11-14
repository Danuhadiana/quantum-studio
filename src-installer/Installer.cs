using System;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Windows.Forms;
using System.Drawing;
using System.Diagnostics;
using System.ComponentModel;

namespace QuantumStudioInstaller
{
    public class InstallerForm : Form
    {
        private Label lblTitle;
        private Label lblSubtitle;
        private Label lblDesc;
        private Label lblPath;
        private TextBox txtPath;
        private Button btnBrowse;
        private CheckBox chkDesktopShortcut;
        private ProgressBar prgDownload;
        private Label lblStatus;
        private Label lblDetails;
        private Button btnInstall;
        private Button btnCancel;
        private Panel pnlHeader;
        private Panel pnlDivider;
        private Panel pnlBottom;
        private PictureBox picLogo;

        private WebClient webClient;
        private string tempZipPath;
        private string installDirectory;
        private bool isInstalled = false;

        private const string DownloadUrl = "https://github.com/Danuhadiana/quantum-studio/releases/download/v1.0.0-beta/quantum-studio-core.zip";

        public InstallerForm()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.Text = "Quantum Studio Setup";
            this.Size = new Size(620, 440);
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(10, 14, 23);
            this.ForeColor = Color.FromArgb(241, 245, 249);
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            // Set Form Icon if exists
            string icoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "icon.ico");
            if (File.Exists(icoPath)) {
                try { this.Icon = new Icon(icoPath); } catch {}
            }

            // Top Header Panel
            pnlHeader = new Panel {
                Dock = DockStyle.Top,
                Height = 85,
                BackColor = Color.FromArgb(15, 23, 42)
            };

            picLogo = new PictureBox {
                Location = new Point(20, 18),
                Size = new Size(48, 48),
                BackColor = Color.FromArgb(255, 84, 41)
            };
            picLogo.Paint += (s, e) => {
                using (var brush = new SolidBrush(Color.White))
                using (var font = new Font("Segoe UI", 22, FontStyle.Bold)) {
                    var sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center };
                    e.Graphics.DrawString("Q", font, brush, new RectangleF(0, 0, 48, 48), sf);
                }
            };

            lblTitle = new Label {
                Text = "Quantum Studio Desktop",
                Location = new Point(80, 18),
                AutoSize = true,
                Font = new Font("Segoe UI", 15f, FontStyle.Bold),
                ForeColor = Color.White
            };

            lblSubtitle = new Label {
                Text = "Installer Ringan Windows • Remotion Code & Multi-AI Video Studio",
                Location = new Point(82, 48),
                AutoSize = true,
                Font = new Font("Segoe UI", 8.5f, FontStyle.Regular),
                ForeColor = Color.FromArgb(148, 163, 184)
            };

            pnlHeader.Controls.Add(picLogo);
            pnlHeader.Controls.Add(lblTitle);
            pnlHeader.Controls.Add(lblSubtitle);

            pnlDivider = new Panel {
                Dock = DockStyle.Top,
                Height = 1,
                BackColor = Color.FromArgb(30, 41, 59)
            };

            // Main Body Controls
            lblDesc = new Label {
                Text = "Installer ini akan memasang aplikasi Quantum Studio di komputer Anda secara otomatis.",
                Location = new Point(24, 105),
                Size = new Size(560, 24),
                ForeColor = Color.FromArgb(203, 213, 225)
            };

            lblPath = new Label {
                Text = "Lokasi Pemasangan:",
                Location = new Point(24, 138),
                AutoSize = true,
                Font = new Font("Segoe UI", 9f, FontStyle.Bold),
                ForeColor = Color.FromArgb(148, 163, 184)
            };

            string defaultPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Programs\QuantumStudio");
            txtPath = new TextBox {
                Text = defaultPath,
                Location = new Point(24, 162),
                Size = new Size(470, 26),
                BackColor = Color.FromArgb(15, 23, 42),
                ForeColor = Color.White,
                BorderStyle = BorderStyle.FixedSingle
            };

            btnBrowse = new Button {
                Text = "Ubah...",
                Location = new Point(504, 161),
                Size = new Size(80, 28),
                BackColor = Color.FromArgb(30, 41, 59),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnBrowse.FlatAppearance.BorderColor = Color.FromArgb(51, 65, 85);
            btnBrowse.Click += (s, e) => {
                using (var fbd = new FolderBrowserDialog()) {
                    fbd.SelectedPath = txtPath.Text;
                    if (fbd.ShowDialog() == DialogResult.OK) {
                        txtPath.Text = fbd.SelectedPath;
                    }
                }
            };

            chkDesktopShortcut = new CheckBox {
                Text = "Buat pintasan di Desktop (Desktop Shortcut)",
                Location = new Point(24, 204),
                AutoSize = true,
                Checked = true,
                ForeColor = Color.FromArgb(226, 232, 240),
                Cursor = Cursors.Hand
            };

            // Progress Section
            prgDownload = new ProgressBar {
                Location = new Point(24, 245),
                Size = new Size(560, 18),
                Style = ProgressBarStyle.Continuous,
                Visible = false
            };

            lblStatus = new Label {
                Text = "Siap mengunduh dan memasang.",
                Location = new Point(24, 270),
                Size = new Size(380, 20),
                ForeColor = Color.FromArgb(148, 163, 184),
                Visible = false
            };

            lblDetails = new Label {
                Text = "",
                Location = new Point(410, 270),
                Size = new Size(174, 20),
                TextAlign = ContentAlignment.TopRight,
                ForeColor = Color.FromArgb(148, 163, 184),
                Visible = false
            };

            // Bottom Panel
            pnlBottom = new Panel {
                Dock = DockStyle.Bottom,
                Height = 65,
                BackColor = Color.FromArgb(15, 23, 42)
            };

            btnCancel = new Button {
                Text = "Batal",
                Location = new Point(390, 16),
                Size = new Size(95, 34),
                BackColor = Color.FromArgb(30, 41, 59),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnCancel.FlatAppearance.BorderColor = Color.FromArgb(51, 65, 85);
            btnCancel.Click += (s, e) => {
                if (webClient != null && webClient.IsBusy) {
                    webClient.CancelAsync();
                }
                this.Close();
            };

            btnInstall = new Button {
                Text = "Pasang Sekarang",
                Location = new Point(495, 16),
                Size = new Size(100, 34),
                BackColor = Color.FromArgb(255, 84, 41),
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnInstall.FlatAppearance.BorderSize = 0;
            btnInstall.Click += BtnInstall_Click;

            pnlBottom.Controls.Add(btnCancel);
            pnlBottom.Controls.Add(btnInstall);

            this.Controls.Add(pnlBottom);
            this.Controls.Add(lblDetails);
            this.Controls.Add(lblStatus);
            this.Controls.Add(prgDownload);
            this.Controls.Add(chkDesktopShortcut);
            this.Controls.Add(btnBrowse);
            this.Controls.Add(txtPath);
            this.Controls.Add(lblPath);
            this.Controls.Add(lblDesc);
            this.Controls.Add(pnlDivider);
            this.Controls.Add(pnlHeader);
        }

        private void BtnInstall_Click(object sender, EventArgs e)
        {
            if (isInstalled) {
                // Launch installed application
                string exePath = Path.Combine(installDirectory, "Quantum Studio.exe");
                if (File.Exists(exePath)) {
                    Process.Start(exePath);
                }
                this.Close();
                return;
            }

            installDirectory = txtPath.Text.Trim();
            if (string.IsNullOrEmpty(installDirectory)) {
                MessageBox.Show("Silakan pilih folder pemasangan.", "Peringatan", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            btnInstall.Enabled = false;
            btnBrowse.Enabled = false;
            txtPath.ReadOnly = true;
            chkDesktopShortcut.Enabled = false;

            prgDownload.Visible = true;
            lblStatus.Visible = true;
            lblDetails.Visible = true;

            // Check if local zip exists in same folder as installer
            string localZip = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "quantum-studio-core.zip");
            if (File.Exists(localZip)) {
                lblStatus.Text = "Menemukan paket lokal. Mengekstrak...";
                ExtractAndFinalize(localZip);
                return;
            }

            // Start Web Download
            StartDownload();
        }

        private void StartDownload()
        {
            try {
                ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072; // TLS 1.2
            } catch {}

            tempZipPath = Path.Combine(Path.GetTempPath(), "quantum-studio-core.zip");
            if (File.Exists(tempZipPath)) {
                try { File.Delete(tempZipPath); } catch {}
            }

            lblStatus.Text = "Menghubungkan ke server GitHub Releases...";
            prgDownload.Value = 0;

            webClient = new WebClient();
            webClient.Headers.Add("User-Agent", "QuantumStudio-Installer/1.0");
            webClient.DownloadProgressChanged += (s, e) => {
                this.BeginInvoke((MethodInvoker)delegate {
                    prgDownload.Value = e.ProgressPercentage;
                    lblStatus.Text = "Mengunduh paket inti Quantum Studio (" + e.ProgressPercentage + "%)...";
                    double mbReceived = e.BytesReceived / (1024.0 * 1024.0);
                    double mbTotal = e.TotalBytesToReceive / (1024.0 * 1024.0);
                    lblDetails.Text = string.Format("{0:0.0} MB / {1:0.0} MB", mbReceived, mbTotal);
                });
            };

            webClient.DownloadFileCompleted += (s, e) => {
                this.BeginInvoke((MethodInvoker)delegate {
                    if (e.Cancelled) {
                        lblStatus.Text = "Pengunduhan dibatalkan.";
                        btnInstall.Enabled = true;
                        return;
                    }
                    if (e.Error != null) {
                        lblStatus.Text = "Gagal mengunduh: " + e.Error.Message;
                        btnInstall.Enabled = true;
                        MessageBox.Show("Gagal mengunduh berkas: " + e.Error.Message + "\nPastikan koneksi internet aktif.", "Kesalahan", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        return;
                    }

                    lblStatus.Text = "Mengunduh selesai. Mengekstrak berkas...";
                    ExtractAndFinalize(tempZipPath);
                });
            };

            try {
                webClient.DownloadFileAsync(new Uri(DownloadUrl), tempZipPath);
            } catch (Exception ex) {
                MessageBox.Show("Gagal memulai unduhan: " + ex.Message, "Kesalahan", MessageBoxButtons.OK, MessageBoxIcon.Error);
                btnInstall.Enabled = true;
            }
        }

        private void ExtractAndFinalize(string zipFilePath)
        {
            var worker = new BackgroundWorker();
            worker.DoWork += (s, e) => {
                if (!Directory.Exists(installDirectory)) {
                    Directory.CreateDirectory(installDirectory);
                }

                // Extract Zip
                using (var archive = ZipFile.OpenRead(zipFilePath)) {
                    foreach (var entry in archive.Entries) {
                        string fullPath = Path.Combine(installDirectory, entry.FullName);
                        if (string.IsNullOrEmpty(entry.Name)) {
                            Directory.CreateDirectory(fullPath);
                        } else {
                            string dir = Path.GetDirectoryName(fullPath);
                            if (!Directory.Exists(dir)) {
                                Directory.CreateDirectory(dir);
                            }
                            entry.ExtractToFile(fullPath, true);
                        }
                    }
                }

                // Create Shortcuts
                string exePath = Path.Combine(installDirectory, "Quantum Studio.exe");
                if (File.Exists(exePath)) {
                    if (chkDesktopShortcut.Checked) {
                        string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                        CreateShortcut(Path.Combine(desktopPath, "Quantum Studio.lnk"), exePath);
                    }

                    string startMenuPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "Quantum Studio.lnk");
                    CreateShortcut(startMenuPath, exePath);
                }

                // Clean temp file
                if (zipFilePath.StartsWith(Path.GetTempPath())) {
                    try { File.Delete(zipFilePath); } catch {}
                }
            };

            worker.RunWorkerCompleted += (s, e) => {
                if (e.Error != null) {
                    lblStatus.Text = "Gagal memasang: " + e.Error.Message;
                    btnInstall.Enabled = true;
                    MessageBox.Show("Kesalahan ekstraksi: " + e.Error.Message, "Kesalahan", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                isInstalled = true;
                prgDownload.Value = 100;
                lblStatus.Text = "Instalasi Berhasil! Siap digunakan.";
                lblDetails.Text = "100%";
                btnInstall.Text = "Buka Studio";
                btnInstall.BackColor = Color.FromArgb(16, 185, 129); // Emerald Green
                btnInstall.Enabled = true;
                btnCancel.Text = "Keluar";
            };

            worker.RunWorkerAsync();
        }

        private void CreateShortcut(string shortcutPath, string targetExePath)
        {
            try {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType == null) return;
                dynamic shell = Activator.CreateInstance(shellType);
                dynamic shortcut = shell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetExePath;
                shortcut.WorkingDirectory = Path.GetDirectoryName(targetExePath);
                shortcut.Description = "Quantum Studio Desktop";
                shortcut.IconLocation = targetExePath + ",0";
                shortcut.Save();
            } catch {}
        }

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new InstallerForm());
        }
    }
}
