import React from 'react';
import { Box, Card, CardContent, Typography, useMediaQuery, useTheme, IconButton, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';

const TableCards = ({ 
  data = [], 
  columns = [], 
  pagination = null, 
  onPageChange,
  loading = false,
  onEdit,
  onDelete,
  onActivate,
  renderItem,
  keyField = 'id',
  children
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { page = 1, totalPages = 1, total = 0 } = pagination || {};

  const handlePrev = () => {
    if (page > 1 && onPageChange) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages && onPageChange) onPageChange(page + 1);
  };

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.map((item) => (
          <Card key={item[keyField]} sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              {renderItem ? renderItem(item) : (
                columns.map((col, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, py: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">{col.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {col.render ? col.render(item[col.field], item) : item[col.field]}
                    </Typography>
                  </Box>
                ))
              )}
              {(onEdit || onDelete || onActivate) && (
                <Box sx={{ display: 'flex', gap: 0.5, mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'center' }}>
                  {onEdit && (
                    <IconButton size="small" onClick={() => onEdit(item)}>
                      <EditIcon />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton size="small" onClick={() => onDelete(item)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                  {onActivate && (
                    <IconButton size="small" onClick={() => onActivate(item)}>
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
        {data.length === 0 && !loading && (
          <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
            No hay datos
          </Typography>
        )}
        {pagination && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 1 }}>
            <IconButton size="small" onClick={handlePrev} disabled={page <= 1}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body2">{page} / {totalPages}</Typography>
            <IconButton size="small" onClick={handleNext} disabled={page >= totalPages}>
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
          {children}
        </Table>
      </TableContainer>
      {pagination && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, px: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {total} registros
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={handlePrev} disabled={page <= 1}>
              <ArrowBackIcon />
            </IconButton>
            <Chip label={`${page}/${totalPages}`} size="small" />
            <IconButton size="small" onClick={handleNext} disabled={page >= totalPages}>
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TableCards;