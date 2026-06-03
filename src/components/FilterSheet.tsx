import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type Filters = {
  minAge: number;
  maxAge: number;
  maxDistance: number; // 0 = no limit
};

export const DEFAULT_FILTERS: Filters = { minAge: 18, maxAge: 45, maxDistance: 0 };

const DISTANCE_OPTIONS = [
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
  { label: '100 km', value: 100 },
  { label: '250 km', value: 250 },
  { label: 'Visi', value: 0 },
];

type Props = {
  visible: boolean;
  filters: Filters;
  onApply: (filters: Filters) => void;
  onClose: () => void;
};

export default function FilterSheet({ visible, filters, onApply, onClose }: Props) {
  const [local, setLocal] = useState<Filters>(filters);

  const open = () => setLocal(filters);

  const clampMinAge = (delta: number) =>
    setLocal((prev) => ({
      ...prev,
      minAge: Math.max(18, Math.min(prev.maxAge - 1, prev.minAge + delta)),
    }));

  const clampMaxAge = (delta: number) =>
    setLocal((prev) => ({
      ...prev,
      maxAge: Math.max(prev.minAge + 1, Math.min(65, prev.maxAge + delta)),
    }));

  const reset = () => setLocal(DEFAULT_FILTERS);

  const apply = () => {
    onApply(local);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={open}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Filtrai</Text>
          <TouchableOpacity onPress={reset}>
            <Text style={styles.resetText}>Atstatyti</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amžius</Text>
            <View style={styles.rangeRow}>
              <StepControl
                label="Nuo"
                value={local.minAge}
                onMinus={() => clampMinAge(-1)}
                onPlus={() => clampMinAge(1)}
              />
              <View style={styles.rangeDash} />
              <StepControl
                label="Iki"
                value={local.maxAge}
                onMinus={() => clampMaxAge(-1)}
                onPlus={() => clampMaxAge(1)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Atstumas</Text>
            <View style={styles.chips}>
              {DISTANCE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, local.maxDistance === opt.value && styles.chipActive]}
                  onPress={() => setLocal((prev) => ({ ...prev, maxDistance: opt.value }))}
                >
                  <Text
                    style={[
                      styles.chipText,
                      local.maxDistance === opt.value && styles.chipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.applyBtn} onPress={apply}>
          <Text style={styles.applyBtnText}>Taikyti filtrus</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function StepControl({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <View style={styles.stepControl}>
      <Text style={styles.stepLabel}>{label}</Text>
      <View style={styles.stepRow}>
        <TouchableOpacity style={styles.stepBtn} onPress={onMinus}>
          <Ionicons name="remove" size={18} color="#FF6B9D" />
        </TouchableOpacity>
        <Text style={styles.stepValue}>{value}</Text>
        <TouchableOpacity style={styles.stepBtn} onPress={onPlus}>
          <Ionicons name="add" size={18} color="#FF6B9D" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    maxHeight: '75%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#eee',
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
  },
  resetText: {
    fontSize: 14,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  rangeDash: {
    width: 24,
    height: 2,
    backgroundColor: '#ddd',
    marginTop: 18,
    borderRadius: 1,
  },
  stepControl: {
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '600',
    marginBottom: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF0F5',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  stepValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    minWidth: 38,
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#eee',
    backgroundColor: '#FAFAFA',
  },
  chipActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  chipTextActive: {
    color: '#fff',
  },
  applyBtn: {
    backgroundColor: '#FF6B9D',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF6B9D',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
