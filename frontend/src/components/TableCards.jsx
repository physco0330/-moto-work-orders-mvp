import React from 'react';
import { Box, Card, CardContent, Typography, useMediaQuery, useTheme, IconButton, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Select, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';

const TableCards = ({ 
  data = [], 
  columns = [], 
  pagination = null, 
  onPageChange,
  onRowsPerPageChange,
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

  const { page = 1, totalPages = 1, total = 0, pageSize = 10 } = pagination || {};

  const handleChangePage = (event, newPage) => {
    if (onPageChange) onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    if (onRowsPerPageChange) onRowsPerPageChange(event.target.value);
  };

  const ButtonLarge = ({ onClick, children, color, disabled }) => (
    <IconButton 
      onClick={onClick} 
      disabled={disabled}
      sx={{ 
        minWidth: 52, 
        minHeight: 52, 
        bgcolor: disabled ? 'action.disabledBackground' : (color ? `${color}.lighter` : 'action.hover'),
        color: disabled ? 'action.disabled' : (color ? `${color}.main` : 'text.primary'),
        '&:hover': { bgcolor: disabled ? 'action.disabledBackground' : (color ? `${color}.light` : 'action.selected') },
        borderRadius: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      {children}
    </IconButton>
  );

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.map((item) => (
          <Card key={item[keyField]} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'visible' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              {renderItem ? renderItem(item) : (
                columns.map((col, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, py: 0.5, alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>{col.label}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {col.render ? col.render(item[col.field], item) : item[col.field]}
                    </Typography>
                  </Box>
                ))
              )}
              {(onEdit || onDelete || onActivate) && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'center' }}>
                  {onEdit && <ButtonLarge onClick={() => onEdit(item)} color="primary"><EditIcon /></ButtonLarge>}
                  {onDelete && <ButtonLarge onClick={() => onDelete(item)} color="error"><DeleteIcon /></ButtonLarge>}
                  {onActivate && <ButtonLarge onClick={() => onActivate(item)} color="success"><CheckCircleIcon /></ButtonLarge>}
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
        {data.length === 0 && !loading && (
          <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No hay datos</Typography>
        )}
        {pagination && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
            <ButtonLarge onClick={() => page > 1 && onPageChange(page - 1)} disabled={page <= 1}><ArrowBackIcon /></ButtonLarge>
            <Typography sx={{ alignSelf: 'center', px: 2 }}>{page} / {totalPages}</Typography>
            <ButtonLarge onClick={() => page < totalPages && onPageChange(page + 1)} disabled={page >= totalPages}><ArrowForwardIcon /></ButtonLarge>
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
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Filas por página:"
        />
      )}
    </Box>
  );
};

export default TableCards;