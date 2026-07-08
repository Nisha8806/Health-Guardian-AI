import { useState, useRef, useEffect } from 'react';
import { api, fileUrl } from '../lib/api';
import { FamilyMember, Prescription } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  Camera,
  Upload,
  FileText,
  User,
  Calendar,
  Stethoscope,
  ClipboardList,
  Save,
  X,
  CheckCircle,
  Trash2,
  Eye,
  Image as ImageIcon
} from 'lucide-react';

export default function PrescriptionScanner() {
  const { profile } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [formData, setFormData] = useState({
    family_member_id: '',
    doctor_name: '',
    diagnosis: '',
    notes: '',
    prescribed_date: new Date().toISOString().split('T')[0]
  });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;

    try {
      const [family, prescriptionsList] = await Promise.all([
        api.get('/api/family-members'),
        api.get('/api/prescriptions'),
      ]);

      setFamilyMembers(family || []);
      setPrescriptions(prescriptionsList || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        setSelectedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCapturedImage(result);
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!profile || !selectedImage) return;

    setSaving(true);
    try {
      const form = new FormData();
      if (selectedImage) {
        const blob = await fetch(selectedImage).then((r) => r.blob());
        form.append('image', blob, `prescription-${Date.now()}.jpg`);
      }
      form.append('family_member_id', formData.family_member_id || '');
      form.append('doctor_name', formData.doctor_name);
      form.append('diagnosis', formData.diagnosis);
      form.append('notes', formData.notes);
      form.append('prescribed_date', formData.prescribed_date);

      await api.upload('/api/prescriptions', form);

      // Reset form and refresh list
      setFormData({
        family_member_id: '',
        doctor_name: '',
        diagnosis: '',
        notes: '',
        prescribed_date: new Date().toISOString().split('T')[0]
      });
      setCapturedImage(null);
      setSelectedImage(null);
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Failed to save prescription. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prescription?')) return;

    try {
      await api.delete(`/api/prescriptions/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-sky-900">Prescription Scanner</h1>
            <p className="text-sky-600 mt-1">Scan and store your prescriptions securely</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium shadow-lg shadow-sky-200 hover:shadow-xl transition-shadow"
          >
            <Camera className="w-5 h-5" />
            Scan Prescription
          </button>
        </div>

        {/* Scanner Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-sky-100">
                <h2 className="text-xl font-bold text-sky-900">Scan Prescription</h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    stopCamera();
                    setCapturedImage(null);
                    setSelectedImage(null);
                  }}
                  className="w-10 h-10 rounded-xl hover:bg-sky-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-sky-600" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Camera / Image Preview */}
                <div className="relative aspect-video bg-sky-50 rounded-2xl overflow-hidden">
                  {cameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <canvas ref={canvasRef} className="hidden" />
                      <button
                        onClick={capturePhoto}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full bg-white text-sky-900 font-medium shadow-lg"
                      >
                        <Camera className="w-5 h-5" />
                        Capture
                      </button>
                    </>
                  ) : capturedImage ? (
                    <img src={capturedImage} alt="Captured prescription" className="w-full h-full object-contain" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-sky-300 mb-4" />
                      <p className="text-sky-500 mb-4">Capture or upload prescription image</p>
                      <div className="flex gap-3">
                        <button
                          onClick={startCamera}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors"
                        >
                          <Camera className="w-5 h-5" />
                          Use Camera
                        </button>
                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-100 text-sky-700 font-medium cursor-pointer hover:bg-sky-200 transition-colors">
                          <Upload className="w-5 h-5" />
                          Upload Image
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-sky-700 mb-2">Family Member (Optional)</label>
                    <select
                      value={formData.family_member_id}
                      onChange={(e) => setFormData({ ...formData, family_member_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">Self</option>
                      {familyMembers.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sky-700 mb-2">Doctor Name</label>
                    <input
                      type="text"
                      value={formData.doctor_name}
                      onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                      placeholder="Dr. Smith"
                      className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sky-700 mb-2">Diagnosis</label>
                    <input
                      type="text"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      placeholder="Condition being treated"
                      className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sky-700 mb-2">Prescribed Date</label>
                    <input
                      type="date"
                      value={formData.prescribed_date}
                      onChange={(e) => setFormData({ ...formData, prescribed_date: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-sky-700 mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50/50 text-sky-900 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      stopCamera();
                      setCapturedImage(null);
                      setSelectedImage(null);
                    }}
                    className="flex-1 py-3 px-6 rounded-xl border border-sky-200 text-sky-700 font-medium hover:bg-sky-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!selectedImage || saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Prescription
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Prescription Modal */}
        {viewPrescription && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-sky-100">
                <h2 className="text-xl font-bold text-sky-900">Prescription Details</h2>
                <button
                  onClick={() => setViewPrescription(null)}
                  className="w-10 h-10 rounded-xl hover:bg-sky-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-sky-600" />
                </button>
              </div>
              <div className="p-6">
                {viewPrescription.image_url && (
                  <img
                    src={fileUrl(viewPrescription.image_url)}
                    alt="Prescription"
                    className="w-full rounded-xl mb-6"
                  />
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-sky-50">
                    <p className="text-sm text-sky-600 mb-1">Doctor</p>
                    <p className="font-medium text-sky-900">{viewPrescription.doctor_name || 'Not specified'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-sky-50">
                    <p className="text-sm text-sky-600 mb-1">Diagnosis</p>
                    <p className="font-medium text-sky-900">{viewPrescription.diagnosis || 'Not specified'}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-sky-50">
                    <p className="text-sm text-sky-600 mb-1">Date</p>
                    <p className="font-medium text-sky-900">
                      {new Date(viewPrescription.prescribed_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-sky-50">
                    <p className="text-sm text-sky-600 mb-1">Notes</p>
                    <p className="font-medium text-sky-900">{viewPrescription.notes || 'No notes'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(viewPrescription.id)}
                  className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Prescription
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prescriptions List */}
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="p-6 border-b border-sky-100">
            <h2 className="text-lg font-bold text-sky-900">Saved Prescriptions</h2>
          </div>
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-sky-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : prescriptions.length > 0 ? (
            <div className="divide-y divide-sky-100">
              {prescriptions.map(prescription => (
                <div
                  key={prescription.id}
                  className="flex items-center justify-between p-4 hover:bg-sky-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-sky-100 overflow-hidden">
                      {prescription.image_url ? (
                        <img src={fileUrl(prescription.image_url)} alt="Prescription" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-sky-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sky-900">{prescription.diagnosis || 'Untitled Prescription'}</p>
                      <p className="text-sm text-sky-600">{prescription.doctor_name || 'Unknown doctor'}</p>
                      <p className="text-xs text-sky-500 mt-1">
                        {new Date(prescription.prescribed_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewPrescription(prescription)}
                    className="p-2 rounded-xl hover:bg-sky-100 text-sky-600 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-sky-200 mx-auto mb-4" />
              <p className="text-sky-600 font-medium">No prescriptions saved</p>
              <p className="text-sm text-sky-500 mt-1">Scan your first prescription to get started</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
