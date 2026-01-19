import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';

import SheetModal from '../components/SheetModal';
import { createProduct, listProducts, updateProduct } from '../services/products';
import { uploadProductImages } from '../services/uploads';
import type { Product, NewProductInput } from '../types/product';

const PRESET_SIZES = ['2Y', '3Y', '4Y', '5Y', '6Y', '7Y', '8Y', '9Y', '10Y'];

type ColorOption = { name: string; hex: string };

const COLOR_OPTIONS: ColorOption[] = [
  { name: 'Black', hex: '#111827' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Yellow', hex: '#EAB308' },
];

function parseCommaList(s: string): string[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

function currency(n: number) {
  try {
    return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(n);
  } catch {
    return `EGP ${n}`;
  }
}

export default function ProductsScreen() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [open, setOpen] = useState(false);

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceText, setPriceText] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [stockBySize, setStockBySize] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColorsText, setCustomColorsText] = useState('');
  const [customSizesText, setCustomSizesText] = useState('');
  const [isActive, setIsActive] = useState(true);

  // images
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [pickedFiles, setPickedFiles] = useState<File[]>([]);
  const [pickedPreviews, setPickedPreviews] = useState<string[]>([]);

  const isEditMode = editingId !== null;

  const price = useMemo(() => {
    const n = Number(priceText);
    return Number.isFinite(n) ? n : NaN;
  }, [priceText]);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!description.trim()) return false;
    if (!Number.isFinite(price) || price <= 0) return false;
    if (selectedSizes.length === 0) return false;

    for (const s of selectedSizes) {
      const raw = stockBySize[s];
      if (raw === undefined || raw === null || raw === '') return false;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) return false;
    }

    if (selectedColors.length === 0) return false;

    return true;
  }, [name, description, price, selectedSizes, stockBySize, selectedColors]);

  async function refreshProducts() {
    setLoading(true);
    setError(null);
    try {
      const next = await listProducts();
      setProducts(next);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanupPreviews() {
    // only relevant on web
    if (Platform.OS === 'web') {
      pickedPreviews.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
    }
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setDescription('');
    setPriceText('');
    setSelectedSizes([]);
    setStockBySize({});
    setSelectedColors([]);
    setCustomColorsText('');
    setCustomSizesText('');
    setIsActive(true);

    setImageUrls([]);
    cleanupPreviews();
    setPickedFiles([]);
    setPickedPreviews([]);
  }

  function openCreate() {
    setError(null);
    resetForm();
    setOpen(true);
  }

  function openEdit(p: Product) {
    setError(null);
    setEditingId(p.id);
    setName(p.name ?? '');
    setDescription(p.description ?? '');
    setPriceText(String(p.price ?? ''));
    setSelectedSizes(p.sizes ?? []);
    setSelectedColors(p.colors ?? []);
    setIsActive(Boolean(p.isActive));

    const sb: Record<string, string> = {};
    const stock = p.stockBySize ?? {};
    (p.sizes ?? []).forEach((s) => {
      const v = stock[s];
      sb[s] = typeof v === 'number' ? String(v) : '0';
    });
    setStockBySize(sb);

    setCustomColorsText('');
    setCustomSizesText('');

    setImageUrls(p.imageUrls ?? []);
    cleanupPreviews();
    setPickedFiles([]);
    setPickedPreviews([]);

    setOpen(true);
  }

  function toggleInArray(arr: string[], value: string) {
    if (arr.includes(value)) return arr.filter((x) => x !== value);
    return [...arr, value];
  }

  function toggleSize(size: string) {
    const next = toggleInArray(selectedSizes, size);
    setSelectedSizes(next);

    if (!selectedSizes.includes(size)) {
      setStockBySize((prev) => ({ ...prev, [size]: prev[size] ?? '0' }));
    } else {
      setStockBySize((prev) => {
        const copy = { ...prev };
        delete copy[size];
        return copy;
      });
    }
  }

  function toggleColor(colorName: string) {
    setSelectedColors((prev) => toggleInArray(prev, colorName));
  }

  function applyCustomSizes() {
    const extra = parseCommaList(customSizesText);
    if (extra.length === 0) return;

    extra.forEach((s) => {
      if (!selectedSizes.includes(s)) {
        setSelectedSizes((prev) => [...prev, s]);
        setStockBySize((prev) => ({ ...prev, [s]: prev[s] ?? '0' }));
      }
    });

    setCustomSizesText('');
  }

  function applyCustomColors() {
    const extra = parseCommaList(customColorsText);
    if (extra.length === 0) return;

    extra.forEach((c) => {
      const normalized = c.trim();
      if (!normalized) return;
      if (!selectedColors.includes(normalized)) setSelectedColors((prev) => [...prev, normalized]);
    });

    setCustomColorsText('');
  }

  function onPickImagesWeb(e: any) {
    const files: File[] = Array.from(e?.target?.files ?? []);
    cleanupPreviews();
    setPickedFiles(files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setPickedPreviews(previews);
  }

  function removePickedAt(index: number) {
    const file = pickedFiles[index];
    const prev = pickedPreviews[index];

    if (Platform.OS === 'web' && prev) {
      try {
        URL.revokeObjectURL(prev);
      } catch {}
    }

    setPickedFiles((arr) => arr.filter((_, i) => i !== index));
    setPickedPreviews((arr) => arr.filter((_, i) => i !== index));
  }

  function removeExistingUrl(url: string) {
    // Note: this only removes from Firestore list; it does not delete from Storage yet.
    setImageUrls((prev) => prev.filter((u) => u !== url));
  }

  async function onSubmit() {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const stockFinal: Record<string, number> = {};
      for (const s of selectedSizes) stockFinal[s] = Number(stockBySize[s] ?? 0);

      const basePayload: NewProductInput = {
        name: name.trim(),
        description: description.trim(),
        price,
        colors: selectedColors,
        sizes: selectedSizes,
        stockBySize: stockFinal,
        imageUrls: imageUrls, // keep existing unless we add more below
        isActive,
      };

      if (isEditMode && editingId) {
        let merged = imageUrls;

        if (pickedFiles.length > 0) {
          const newUrls = await uploadProductImages(editingId, pickedFiles);
          merged = Array.from(new Set([...imageUrls, ...newUrls]));
          setImageUrls(merged);
        }

        await updateProduct(editingId, { ...basePayload, imageUrls: merged });
      } else {
        // Create first to get doc id
        const newId = await createProduct({ ...basePayload, imageUrls: [] });

        let urls: string[] = [];
        if (pickedFiles.length > 0) {
          urls = await uploadProductImages(newId, pickedFiles);
          await updateProduct(newId, { imageUrls: urls });
        }
      }

      await refreshProducts();
      setOpen(false);
      resetForm();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Products</Text>
          <Text style={styles.subtitle}>Create, update, and manage Kuddles inventory.</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]} onPress={openCreate}>
          <Text style={styles.primaryBtnText}>+ New product</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Products list */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Current products</Text>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}
            onPress={refreshProducts}
            disabled={loading}
          >
            <Text style={styles.secondaryBtnText}>Refresh</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={styles.muted}>Loading...</Text>
          </View>
        ) : null}

        <ScrollView style={{ maxHeight: 720 }}>
          {products.length === 0 && !loading ? (
            <Text style={styles.muted}>No products yet. Create your first product.</Text>
          ) : null}

          {products.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => openEdit(p)}
              style={({ pressed }) => [styles.productRow, pressed && { opacity: 0.92 }]}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <View style={styles.thumbWrap}>
                    {p.imageUrls?.[0] ? (
                      <Image source={{ uri: p.imageUrls[0] }} style={styles.thumb} />
                    ) : (
                      <View style={styles.thumbEmpty}>
                        <Text style={styles.thumbEmptyText}>IMG</Text>
                      </View>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <Text style={styles.productMeta}>
                      {currency(p.price)} • {(p.sizes?.length ?? 0)} sizes • {p.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>

                  <View style={styles.editBadge}>
                    <Text style={styles.editBadgeText}>Edit</Text>
                  </View>
                </View>

                <View style={styles.pillsRow}>
                  {(p.colors ?? []).slice(0, 6).map((c) => (
                    <View key={c} style={styles.pill}>
                      <Text style={styles.pillText}>{c}</Text>
                    </View>
                  ))}
                  {(p.colors?.length ?? 0) > 6 ? (
                    <Text style={styles.mutedSmall}>+{(p.colors?.length ?? 0) - 6}</Text>
                  ) : null}
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Modal sheet */}
      <SheetModal
        visible={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetTitle}>{isEditMode ? 'Edit product' : 'New product'}</Text>
            <Text style={styles.sheetSubtitle}>
              {isEditMode ? 'Update details and save changes.' : 'Add a product to your storefront.'}
            </Text>
          </View>

          <Pressable onPress={() => setOpen(false)} style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.8 }]}>
            <Text style={styles.iconBtnText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={{ maxHeight: 580 }} contentContainerStyle={{ paddingBottom: 14 }}>
          {/* Basics */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basics</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Product name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Kuddles Hoodie"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Short, clear description. What makes it special?"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, styles.textarea]}
                multiline
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Price (EGP)</Text>
              <TextInput
                value={priceText}
                onChangeText={setPriceText}
                placeholder="e.g., 650"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.toggleRow}>
              <Pressable
                onPress={() => setIsActive((v) => !v)}
                style={[styles.toggle, isActive ? styles.toggleOn : styles.toggleOff]}
              >
                <View style={[styles.toggleDot, isActive ? styles.toggleDotOn : styles.toggleDotOff]} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Active</Text>
                <Text style={styles.mutedSmall}>Inactive products won’t show up on the client side.</Text>
              </View>
            </View>
          </View>

          {/* Sizes + stock */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Sizes & stock</Text>
            <Text style={styles.mutedSmall}>Select sizes and set stock for each size.</Text>

            <View style={styles.chipsWrap}>
              {PRESET_SIZES.map((s) => {
                const active = selectedSizes.includes(s);
                return (
                  <Pressable key={s} onPress={() => toggleSize(s)} style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{s}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.inlineRow}>
              <TextInput
                value={customSizesText}
                onChangeText={setCustomSizesText}
                placeholder="Custom sizes (comma-separated), e.g. XS,S,M"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, { flex: 1 }]}
              />
              <Pressable style={styles.secondaryBtn} onPress={applyCustomSizes}>
                <Text style={styles.secondaryBtnText}>Add</Text>
              </Pressable>
            </View>

            {selectedSizes.length > 0 ? (
              <View style={styles.stockTable}>
                {selectedSizes.map((s) => (
                  <View key={s} style={styles.stockRow}>
                    <Text style={styles.stockSize}>{s}</Text>
                    <TextInput
                      value={stockBySize[s] ?? ''}
                      onChangeText={(v) => setStockBySize((prev) => ({ ...prev, [s]: v }))}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      style={[styles.input, styles.stockInput]}
                      keyboardType="numeric"
                    />
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* Colors (circles) */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Colors</Text>
            <Text style={styles.mutedSmall}>Click to select colors. Stored as names in the database.</Text>

            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((c) => {
                const active = selectedColors.includes(c.name);
                const isWhite = c.hex.toLowerCase() === '#ffffff';

                return (
                  <Pressable
                    key={c.name}
                    onPress={() => toggleColor(c.name)}
                    style={({ pressed }) => [styles.colorItem, pressed && { opacity: 0.9 }]}
                  >
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: c.hex },
                        isWhite && { borderWidth: 1, borderColor: '#E5E7EB' },
                        active && styles.colorDotActive,
                      ]}
                    />
                    <Text style={[styles.colorLabel, active && styles.colorLabelActive]}>{c.name}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.inlineRow}>
              <TextInput
                value={customColorsText}
                onChangeText={setCustomColorsText}
                placeholder="Custom colors (comma-separated), e.g. Navy, Cream"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, { flex: 1 }]}
              />
              <Pressable style={styles.secondaryBtn} onPress={applyCustomColors}>
                <Text style={styles.secondaryBtnText}>Add</Text>
              </Pressable>
            </View>

            {selectedColors.length > 0 ? (
              <View style={styles.selectedRow}>
                {selectedColors.map((c) => (
                  <View key={c} style={styles.pill}>
                    <Text style={styles.pillText}>{c}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* Images */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Images</Text>
            <Text style={styles.mutedSmall}>Upload product images. The first one will be used as the thumbnail.</Text>

            {Platform.OS === 'web' ? (
              <View style={{ marginTop: 10 }}>
                {/* @ts-ignore */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPickImagesWeb}
                  style={{ marginBottom: 12 }}
                />

                {pickedPreviews.length > 0 ? (
                  <>
                    <Text style={styles.mutedSmall}>New (will upload on Save)</Text>
                    <View style={styles.previewRow}>
                      {pickedPreviews.map((uri, idx) => (
                        <View key={uri} style={styles.previewWrap}>
                          <Image source={{ uri }} style={styles.previewImg} />
                          <Pressable style={styles.previewRemove} onPress={() => removePickedAt(idx)}>
                            <Text style={styles.previewRemoveText}>✕</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}

                {imageUrls.length > 0 ? (
                  <>
                    <Text style={[styles.mutedSmall, { marginTop: 12 }]}>Existing</Text>
                    <View style={styles.previewRow}>
                      {imageUrls.slice(0, 12).map((uri) => (
                        <View key={uri} style={styles.previewWrap}>
                          <Image source={{ uri }} style={styles.previewImg} />
                          <Pressable style={styles.previewRemove} onPress={() => removeExistingUrl(uri)}>
                            <Text style={styles.previewRemoveText}>✕</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                    <Text style={[styles.mutedSmall, { marginTop: 8 }]}>
                      Removing here only updates Firestore; Storage deletion can be added next.
                    </Text>
                  </>
                ) : null}
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.muted}>Image picking for mobile next (we’ll add expo-image-picker).</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.sheetFooter}>
          <Pressable
            style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.85 }]}
            onPress={() => {
              setOpen(false);
              resetForm();
            }}
          >
            <Text style={styles.ghostBtnText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.submitBtn,
              !canSubmit && { opacity: 0.45 },
              pressed && canSubmit && { opacity: 0.9 },
            ]}
            onPress={onSubmit}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator color="white" />
                <Text style={styles.submitBtnText}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.submitBtnText}>{isEditMode ? 'Save changes' : 'Create product'}</Text>
            )}
          </Pressable>
        </View>
      </SheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F6F7FB' },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  title: { fontSize: 28, fontWeight: '900', color: '#111827' },
  subtitle: { marginTop: 4, color: '#6B7280' },

  primaryBtn: { backgroundColor: '#2563EB', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  primaryBtnText: { color: 'white', fontWeight: '800', fontSize: 14 },

  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryBtnText: { color: '#111827', fontWeight: '800', fontSize: 13 },

  errorBox: { marginTop: 14, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', padding: 12, borderRadius: 12 },
  errorText: { color: '#991B1B', fontWeight: '700' },

  card: { marginTop: 16, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E9E9EE' },

  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },

  muted: { color: '#6B7280' },
  mutedSmall: { color: '#6B7280', fontSize: 12, marginTop: 4 },

  loadingRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 10 },

  productRow: {
    gap: 10,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F4',
  },

  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  thumbWrap: { width: 44, height: 44, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  thumb: { width: 44, height: 44 },
  thumbEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  thumbEmptyText: { fontSize: 10, fontWeight: '900', color: '#9CA3AF' },

  productName: { fontSize: 14, fontWeight: '900', color: '#111827' },
  productMeta: { marginTop: 3, color: '#6B7280', fontSize: 12 },

  pillsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' },
  pill: { backgroundColor: '#F3F4F6', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  pillText: { fontSize: 12, fontWeight: '700', color: '#374151' },

  editBadge: { backgroundColor: '#EAF2FF', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 },
  editBadgeText: { fontSize: 12, fontWeight: '900', color: '#1D4ED8' },

  // Sheet
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sheetTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  sheetSubtitle: { marginTop: 4, color: '#6B7280' },

  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 16, fontWeight: '900', color: '#111827' },

  formSection: { paddingTop: 10, paddingBottom: 14, borderTopWidth: 1, borderTopColor: '#F0F0F4' },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#111827', marginBottom: 8 },

  field: { marginTop: 10 },
  label: { fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 6 },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  textarea: { minHeight: 92, textAlignVertical: 'top' },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  toggle: { width: 48, height: 28, borderRadius: 999, padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: '#2563EB' },
  toggleOff: { backgroundColor: '#E5E7EB' },
  toggleDot: { width: 22, height: 22, borderRadius: 999 },
  toggleDotOn: { backgroundColor: 'white', alignSelf: 'flex-end' },
  toggleDotOff: { backgroundColor: 'white', alignSelf: 'flex-start' },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: { borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
  chipActive: { backgroundColor: '#EAF2FF', borderColor: '#93C5FD' },
  chipText: { fontSize: 12, fontWeight: '800', color: '#111827' },
  chipTextActive: { color: '#1D4ED8' },

  inlineRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12 },

  stockTable: { marginTop: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, overflow: 'hidden' },
  stockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderTopWidth: 1, borderTopColor: '#F0F0F4' },
  stockSize: { fontWeight: '900', color: '#111827' },
  stockInput: { width: 120, textAlign: 'center' },

  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10 },
  colorItem: { alignItems: 'center', width: 72 },
  colorDot: { width: 28, height: 28, borderRadius: 999 },
  colorDotActive: { borderWidth: 3, borderColor: '#2563EB' },
  colorLabel: { marginTop: 6, fontSize: 12, fontWeight: '700', color: '#6B7280' },
  colorLabelActive: { color: '#111827' },

  selectedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, alignItems: 'center' },

  imagePlaceholder: { marginTop: 10, height: 92, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },

  previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  previewWrap: { position: 'relative' as any },
  previewImg: { width: 64, height: 64, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  previewRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  previewRemoveText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },

  sheetFooter: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end', marginTop: 12 },

  ghostBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#F3F4F6' },
  ghostBtnText: { fontWeight: '900', color: '#111827' },

  submitBtn: { backgroundColor: '#2563EB', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, minWidth: 160, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: 'white', fontWeight: '900' },
});
