import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, text } from '../theme';

type Props = {
  children: React.ReactNode;
  title?: string;
};

export function Alert({ children, title }: Props) {
  return (
    <View style={styles.wrap}>
      {title ? <Text style={[text.alertBody, styles.title]}>{title}</Text> : null}
      {typeof children === 'string' ? (
        <Text style={text.alertBody}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.accentTint,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    borderRadius: radii.alert,
    paddingVertical: spacing.alertV,
    paddingHorizontal: spacing.alertH,
    marginBottom: 10,
  },
  title: { color: colors.accent, fontWeight: '600', marginBottom: 4 },
});
