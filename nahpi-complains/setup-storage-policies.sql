-- Storage policies for complaint-attachments bucket
-- These policies need to be run in the Supabase SQL editor

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to upload files to their own complaint folders
CREATE POLICY "Users can upload complaint attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'complaint-attachments' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT c.id::text 
    FROM complaints c 
    WHERE c.student_id = auth.uid()
  )
);

-- Policy 2: Allow users to view their own complaint attachments
CREATE POLICY "Users can view their complaint attachments" ON storage.objects
FOR SELECT USING (
  bucket_id = 'complaint-attachments' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT c.id::text 
    FROM complaints c 
    WHERE c.student_id = auth.uid()
  )
);

-- Policy 3: Allow department officers to view attachments for their department's complaints
CREATE POLICY "Department officers can view department complaint attachments" ON storage.objects
FOR SELECT USING (
  bucket_id = 'complaint-attachments' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 
    FROM complaints c
    JOIN users u ON u.id = auth.uid()
    JOIN department_officers do ON do.user_id = u.id
    WHERE c.id::text = (storage.foldername(name))[1]
    AND c.department_id = do.department_id
  )
);

-- Policy 4: Allow admins to view all complaint attachments
CREATE POLICY "Admins can view all complaint attachments" ON storage.objects
FOR SELECT USING (
  bucket_id = 'complaint-attachments' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 
    FROM users u 
    WHERE u.id = auth.uid() 
    AND u.role = 'admin'
  )
);

-- Policy 5: Allow users to delete their own complaint attachments (if needed)
CREATE POLICY "Users can delete their complaint attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'complaint-attachments' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN (
    SELECT c.id::text 
    FROM complaints c 
    WHERE c.student_id = auth.uid()
  )
);

-- Alternative simpler policies (if the above are too complex)
-- Uncomment these and comment out the above if needed

/*
-- Simple policy: Allow authenticated users to upload to complaint-attachments
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'complaint-attachments' 
  AND auth.role() = 'authenticated'
);

-- Simple policy: Allow authenticated users to view complaint-attachments
CREATE POLICY "Authenticated users can view" ON storage.objects
FOR SELECT USING (
  bucket_id = 'complaint-attachments' 
  AND auth.role() = 'authenticated'
);

-- Simple policy: Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'complaint-attachments' 
  AND auth.role() = 'authenticated'
  AND owner = auth.uid()
);
*/
