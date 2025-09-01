import { http, HttpResponse } from 'msw';

// Mock data
const mockPhotos = [
  {
    id: '1',
    title: 'Test Photo 1',
    description: 'A test photo',
    fabric_type: 'Cotton',
    image_url: 'https://example.com/photo1.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_id: 'user-1',
    sort_order: 1,
  },
  {
    id: '2',
    title: 'Test Photo 2',
    description: 'Another test photo',
    fabric_type: 'Silk',
    image_url: 'https://example.com/photo2.jpg',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    user_id: 'user-1',
    sort_order: 2,
  },
];

const mockFabricTypes = [
  { id: '1', name: 'Cotton', created_at: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'Silk', created_at: '2024-01-01T00:00:00Z' },
  { id: '3', name: 'Wool', created_at: '2024-01-01T00:00:00Z' },
];

export const handlers = [
  // Photos CRUD operations
  http.get('https://ypzdjqkqwbxeolfrbodk.supabase.co/rest/v1/photos', ({ request }) => {
    const url = new URL(request.url);
    const select = url.searchParams.get('select');
    const order = url.searchParams.get('order');
    const limit = url.searchParams.get('limit');
    const search = url.searchParams.get('title');

    let filteredPhotos = [...mockPhotos];

    // Handle search
    if (search) {
      const searchTerm = search.replace(/ilike\./g, '').replace(/%/g, '');
      filteredPhotos = filteredPhotos.filter(photo =>
        photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Handle ordering
    if (order) {
      const [field, direction] = order.split('.');
      filteredPhotos.sort((a, b) => {
        const aVal = a[field as keyof typeof a];
        const bVal = b[field as keyof typeof b];
        if (direction === 'desc') {
          return aVal > bVal ? -1 : 1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    // Handle limit
    if (limit) {
      filteredPhotos = filteredPhotos.slice(0, parseInt(limit));
    }

    return HttpResponse.json(filteredPhotos);
  }),

  http.post('https://ypzdjqkqwbxeolfrbodk.supabase.co/rest/v1/photos', async ({ request }) => {
    const newPhoto = await request.json() as any;
    const photo = {
      id: String(mockPhotos.length + 1),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user-1',
      sort_order: mockPhotos.length + 1,
      ...newPhoto,
    };
    mockPhotos.push(photo);
    return HttpResponse.json([photo], { status: 201 });
  }),

  http.patch('https://ypzdjqkqwbxeolfrbodk.supabase.co/rest/v1/photos', async ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const updates = await request.json() as any;

    const photoIndex = mockPhotos.findIndex(p => p.id === id?.replace('eq.', ''));
    if (photoIndex !== -1) {
      mockPhotos[photoIndex] = {
        ...mockPhotos[photoIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return HttpResponse.json([mockPhotos[photoIndex]]);
    }
    return HttpResponse.json({ error: 'Photo not found' }, { status: 404 });
  }),

  http.delete('https://ypzdjqkqwbxeolfrbodk.supabase.co/rest/v1/photos', ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    const photoIndex = mockPhotos.findIndex(p => p.id === id?.replace('eq.', ''));
    if (photoIndex !== -1) {
      const deletedPhoto = mockPhotos.splice(photoIndex, 1)[0];
      return HttpResponse.json([deletedPhoto]);
    }
    return HttpResponse.json({ error: 'Photo not found' }, { status: 404 });
  }),

  // Fabric types CRUD operations
  http.get('https://ypzdjqkqwbxeolfrbodk.supabase.co/rest/v1/fabric_types', () => {
    return HttpResponse.json(mockFabricTypes);
  }),

  http.post('https://ypzdjqkqwbxeolfrbodk.supabase.co/rest/v1/fabric_types', async ({ request }) => {
    const newFabricType = await request.json() as any;
    const fabricType = {
      id: String(mockFabricTypes.length + 1),
      created_at: new Date().toISOString(),
      ...newFabricType,
    };
    mockFabricTypes.push(fabricType);
    return HttpResponse.json([fabricType], { status: 201 });
  }),

  // Storage operations (file upload)
  http.post('https://ypzdjqkqwbxeolfrbodk.supabase.co/storage/v1/object/photos/*', () => {
    return HttpResponse.json({
      Key: 'photos/test-image.jpg',
      ETag: '"mock-etag"',
    });
  }),

  // Auth operations
  http.get('https://ypzdjqkqwbxeolfrbodk.supabase.co/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'user-1',
      email: 'test@example.com',
      role: 'authenticated',
    });
  }),
];
