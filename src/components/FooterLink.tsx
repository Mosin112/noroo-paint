import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { text } from '../theme';

export function FooterLink({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.wrap}>
      <Text style={text.footerLink}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 6, paddingHorizontal: 18, marginBottom: 8 },
});
