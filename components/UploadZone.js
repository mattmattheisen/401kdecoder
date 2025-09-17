'use client';
import { useDropzone } from 'react-dropzone';

export default function UploadZone({ onDrop, loading }){
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    multiple: false,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png','.jpg','.jpeg'] },
    onDrop
  });
  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${isDragActive? 'border-brand-400 bg-slate-900' : 'border-slate-700 bg-slate-900/40'}`}>
      <input {...getInputProps()} />
      <div className="space-y-2">
        <p className="text-slate-200 font-medium">Drag & drop your statement here</p>
        <p className="text-slate-400 text-sm">or click to choose a file</p>
        <button disabled={loading} className="btn mt-2">{loading ? 'Analyzing…' : 'Select file'}</button>
      </div>
    </div>
  );
}
